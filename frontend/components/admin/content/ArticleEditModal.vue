<template>
  <FullscreenModal v-model="model">
    <template #headerTitle>
      <h2>Edit article</h2>
    </template>

    <template #form>
      <!-- Title -->
      <FormGroupInputField v-model="articleData.title" label="Title" icon="i-material-symbols-title" :required="true" />
      
      <!-- Filename -->
      <!-- TODO preview path in help -->
      <FormGroupInputField v-model="articleData.filename" label="File name" help="Determines the URL of the article." icon="i-material-symbols-link" :required="true" />

      <!-- Visibility -->
      <FormGroupCheckbox v-model="articleData.is_visible" label="Published" help="Determines whether the article is visible in the published site." icon="i-material-symbols-visibility-rounded" />

      <!-- View mode -->
      <FormGroupSelect v-model="articleData.view_type" :options="viewOptions" label="Article display" help="Determines how the published article is displayed." icon="i-material-symbols-screenshot-monitor-outline" />

      <!-- Comments -->
      <FormGroupCheckbox v-model="articleData.can_comment" label="Allow comments" icon="i-material-symbols-comment" />

      <!-- Show authors -->
      <FormGroupCheckbox v-model="articleData.show_authors" label="Show authors" icon="i-material-symbols-account-box" />
    </template>

    <template #footer>
      <MutationButton class="btn-primary" :status="patchStatus" :disabled="!canConfirm" @click="confirm">Save</MutationButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query';
import type { ModelRef, Reactive } from 'vue';

const articleService = useArticleService()
const responseToast = useResponseToast()

const props = defineProps<{
  categoryPath: string,
  article: Article,
}>()

const emit = defineEmits<{
  create: [Article],
}>()

/** Modal visibility */
const model: ModelRef<boolean> = defineModel({
  default: false,
})

const articleData: Reactive<ArticleUpdateRequest> = reactive({
  filename: '',
  title: '',
  is_visible: false,
  view_type: 'single_page',
  can_comment: true,
  show_authors: true,
  // TODO authors, category path, sorting index
  // category_sorting_index: 0,
})

const viewOptions = [
  {
    id: 'single_page',
    label: 'Single page',
  },
  {
    id: 'by_sections',
    label: 'Subpage per section',
  },
]

function confirm() {
  requestPatch(articleData)
}

const canConfirm = computed(() => {
  return true // TODO validate fields
})

// Reset field values when the props change
watchEffect(() => {
  const article = props.article
  if (props.categoryPath && article) {
    articleData.filename = article.filename
    articleData.title = article.title
    articleData.is_visible = article.is_visible
    articleData.view_type = article.view_type
    articleData.can_comment = article.can_comment
    articleData.show_authors = article.show_authors
  }
})

/** Query for creating the article */
const { mutate: requestPatch, status: patchStatus } = useMutation({
  mutationFn: (request: ArticleUpdateRequest) => {
    return articleService.updateArticle(props.categoryPath + '/' + props.article.filename, request)
  },
  onSuccess: (article) => {
    emit('create', article)
    responseToast.showSuccess('Article updated')
    model.value = false // Close the modal
  },
  onError: (err) => {
    responseToast.showError('Failed to update article', err)
  }
})

defineShortcuts({
  // Enter key submits the form
  enter: {
    usingInput: true,
    whenever: [canConfirm],
    handler: () => {
      confirm()
    },
  }
})

</script>