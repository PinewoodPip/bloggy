<template>
  <FullscreenModal v-model="visible" :can-confirm="canConfirm" :confirm-callback="confirm">
    <template #headerTitle>
      <h2>{{ headerLabel }}</h2>
    </template>

    <template #form>
      <!-- Type -->
      <FormGroupSelect v-model="node.type" :options="typeOptions" value-attribute="id" label="Type" icon="i-material-symbols-title" :readonly="!canEditType" />

      <!-- Group name -->
      <FormGroupInputField v-if="node.type === 'group'" v-model="(node as NavigationNodeGroupInput).name" label="Name" icon="material-symbols:drive-file-rename-outline" />

      <!-- External URL link -->
      <FormGroupInputField v-if="node.type === 'external_url'" v-model="(node as NavigationExternalLink).url" label="Link URL" help="Determines the URL of the category." icon="i-material-symbols-link" />
      
      <!-- External URL title -->
      <FormGroupInputField v-if="node.type === 'external_url'" v-model="(node as NavigationExternalLink).title" label="Link Title" help="Determines the URL of the category." icon="material-symbols:drive-file-rename-outline" />
      
      <!-- Category -->
      <FormGroupArticle v-if="node.type === 'category'" v-model="(node as NavigationCategoryInput).category_path" type="category" label="Category" hint="Category the item will link to." icon="material-symbols:folder" />

      <!-- Article -->
      <FormGroupArticle v-if="node.type === 'article'" v-model="(node as NavigationArticleInput).article_filename" type="article" label="Article" hint="Article the item will link to." icon="material-symbols:article-outline" />
    </template>

    <template #footer>
      <!-- Confirm button -->
      <IconButton class="btn-primary" icon="i-material-symbols-folder-check-2-rounded" :disabled="!canConfirm" @click="confirm">Confirm</IconButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import type { ModelRef, Reactive } from 'vue';
import type { NavigationArticle, NavigationArticleInput, NavigationCategoryInput, NavigationExternalLink, NavigationNodeGroupInput, NavigationNodeInput, NavigationNodeType } from '~/services/site';

// @ts-ignore
const node: Ref<NavigationNodeInput> = ref({})

const emit = defineEmits<{
  confirm: [NavigationNodeInput],
}>()

const visible = ref(false)
const canEditType = ref(true)
const isEditing = ref(false)

/** Opens the modal to create a new node. */
function open(nodeType?: NavigationNodeType) {
  node.value = {} as NavigationNodeInput
  node.value.type = nodeType || 'group'
  visible.value = true
  canEditType.value = true
}

/** Opens the modal to edit an existing node. */
function edit(templateNode: NavigationNodeInput) {
  node.value = {} as NavigationNodeInput

  // Copy node props
  if (templateNode) {
    Object.assign(node, templateNode)
  }
  visible.value = true
  canEditType.value = false
}

defineExpose({
  open,
  edit,
})

function confirm() {
  let articleFilename = undefined
  let categoryPath = undefined
  if (node.value.type === 'article') {
    const parts = node.value.article_filename.split('/')
    articleFilename = parts[parts.length - 1]
    categoryPath = parts.slice(undefined, parts.length - 1).join('/')
    if (!categoryPath.startsWith('/')) {
      categoryPath = '/' + categoryPath
    }
  } else {
    // @ts-ignore
    categoryPath = node.value.category_path
  }
  emit('confirm', {
    ...node.value,
    // @ts-ignore
    children: [...node.value.children || []],
    // @ts-ignore
    article_filename: articleFilename,
    category_path: categoryPath,
  })
  visible.value = false
}

/** Options for the node type combobox. */
const typeOptions = [
  {
    id: 'group',
    label: 'Group',
  },
  {
    id: 'article',
    label: 'Article',
  },
  {
    id: 'category',
    label: 'Category',
  },
  {
    id: 'external_url',
    label: 'External Link',
  },
]

const canConfirm = computed(() => {
  const nodeData = node.value
  switch (nodeData.type) {
    case 'article': {
      return nodeData.article_filename !== undefined && (nodeData.article_filename !== '')
    }
    case 'category': {
      return nodeData.category_path !== undefined && (nodeData.category_path !== '')
    }
    case 'external_url': {
      return nodeData.url !== undefined && (nodeData.url !== '')
    }
    case 'group': {
      return nodeData.name !== undefined && (nodeData.name !== '')
    }
    default: {
      return false
    }
  }
})

const headerLabel = computed(() => {
  return isEditing.value ? 'Edit item' : 'Create item'
})

</script>