<!-- Modal for selecting an article/category from the CMS. -->
<template>
  <FullscreenModal v-model="visible" :can-confirm="canConfirm" :confirm-callback="confirm">
    <template #headerTitle>
      Select file
    </template>
    <template #form>
      <!-- File tree -->
      <AdminTreeItem v-if="filesRoot" :item="filesRoot" @click="onFileSelected">
        <template #buttons="btnProps">
          <!-- No buttons. -->
        </template>
      </AdminTreeItem>
      <LoadingSpinner v-else />
    </template>
    <template #footer>
      <IconButton class="btn-primary" icon="material-symbols:upload-file" @click="confirm" :disabled="!canConfirm">Confirm</IconButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import type { TreeItemGetters } from '../TreeItem.vue';

const { data: filesRoot, status: filesStatus } = useContentTree()
const getters = useContentTreeGetters()
// Adjust getters
getters.canEditLeaf = () => false
getters.canCreateLeaf = () => false
getters.canCollapse = false
getters.isSelected = (node: Category | ArticlePreview) => {
  return selectedFilePath.value === node.path
}
provide<TreeItemGetters<Category, ArticlePreview>>('siteFileTree', getters)

const emit = defineEmits<{
  confirm: [path],
}>()

const props = defineProps<{
  canSelectArticles?: boolean,
  canSelectCategories?: boolean,
}>();

const selectedFilePath = ref('')
const visible = ref(false)

/** Opens the file selection modal. */
function open() {
  visible.value = true
}
defineExpose({
  open,
})

function confirm() {
  emit('confirm', selectedFilePath.value)
  visible.value = false
}

/** Updates tracking the selected file. */
function onFileSelected(node: Category | ArticlePreview) {
  const nodeType = getters.getNodeType(node)
  if ((nodeType === 'leaf' && props.canSelectArticles) || (nodeType === 'node' && props.canSelectCategories)) {
    selectedFilePath.value = node.path
  }
}

const canConfirm = computed(() => {
  return selectedFilePath.value !== '' // A file must be selected
})

</script>