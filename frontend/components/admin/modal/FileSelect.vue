<!-- Modal for selecting a file from the CMS. -->
<template>
  <FullscreenModal v-model="visible" :can-confirm="canConfirm" :confirm-callback="confirm">
    <template #headerTitle>
      Select file
    </template>
    <template #form>
      <!-- File tree -->
      <AdminTreeItem v-if="filesRoot" :item="filesRoot" @click="onFileSelected" />
      <LoadingSpinner v-else />
    </template>
    <template #footer>
      <IconButton class="btn-primary" icon="material-symbols:upload-file" @click="confirm" :disabled="!canConfirm">Confirm</IconButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import type { TreeItemGetters } from '../TreeItem.vue';

const { data: filesRoot, status: filesStatus } = useSiteFiles()
const getters = useSiteFileTree()
// Adjust getters
getters.canEditLeaf = () => false
getters.canCreateLeaf = () => false
provide<TreeItemGetters<SiteFileTree, SiteFile>>('siteFileTree', getters)

const emit = defineEmits<{
  confirm: [path],
}>()

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

function onFileSelected(node: SiteFileTree | SiteFile) {
  if (getters.getNodeType(node) === 'leaf') {
    selectedFilePath.value = node.path
  }
}

const canConfirm = computed(() => {
  return selectedFilePath.value !== '' // A file must be selected
})

</script>