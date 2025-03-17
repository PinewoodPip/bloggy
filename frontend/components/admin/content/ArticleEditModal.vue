<template>
  <FullscreenModal v-model="model" :can-confirm="canConfirm" :confirm-callback="confirm">
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
      <FormGroupCheckbox v-model="articleData.is_visible" label="Visible" help="Determines whether the article is visible in the published site." icon="i-material-symbols-visibility-rounded" />

      <FormGroupInputField v-model="publishDate" type="datetime-local" label="Publish date" help="The article will be hidden from the site until this date." icon="i-material-symbols-calendar-today" />

      <!-- View mode -->
      <FormGroupSelect v-model="articleData.view_type" :options="viewOptions" label="Article display" help="Determines how the published article is displayed." icon="i-material-symbols-screenshot-monitor-outline" />

      <!-- Comments -->
      <FormGroupCheckbox v-model="articleData.can_comment" label="Allow comments" help="Whether comments can be posted on the article. Toggling this option is non-destructive." icon="i-material-symbols-comment" />

      <!-- Authors -->
      <FormGroupMultiselect v-if="editors" v-model="chosenAuthors" :options="editors" :multiple="true" track-by="username" label="Authors" help="May be displayed in the published site." option-label-key="display_name" :show-labels="true" :searchable="true" placeholder="Select authors" aria-label="select authors" :disabled="editorsStatus !== 'success'" />

      <!-- Show authors -->
      <FormGroupCheckbox v-model="articleData.show_authors" label="Show authors" help="Whether to show author names and cards in the published article page." icon="i-material-symbols-account-box" />
    </template>

    <template #footer>
      <MutationButton class="btn-primary" icon="i-material-symbols-edit-document" :status="patchStatus" :disabled="!canConfirm" @click="confirm">Save</MutationButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query';
import type { ModelRef, Reactive } from 'vue';

const articleService = useArticleService()
const responseToast = useResponseToast()
const { data: editors, status: editorsStatus } = useEditors()

const props = defineProps<{
  categoryPath: string,
  article: Article,
}>()

const emit = defineEmits<{
  update: [Article],
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
const chosenAuthors: Ref<User[]> = ref([])
const publishDate: Ref<string | undefined> = ref(undefined)

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
  requestPatch({
    authors: chosenAuthors.value.map((author) => author.username),
    publish_time: utcDateStr.value!,
    ...articleData,
  })
}

const canConfirm = computed(() => {
  return chosenAuthors.value.length >= 1
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
    chosenAuthors.value = article.authors
    publishDate.value = article.publish_time ? article.publish_time : undefined
  }
})

/**
 * UTC ISO date string of the publish time.
 */
const utcDateStr = computed(() => {
  if (publishDate.value) {
    let date = new Date(publishDate.value);
    return date.toISOString()
  } else {
    return null
  }
})

/** Query for creating the article */
const { mutate: requestPatch, status: patchStatus } = useMutation({
  mutationFn: (request: ArticleUpdateRequest) => {
    return articleService.updateArticle(props.categoryPath + '/' + props.article.filename, request)
  },
  onSuccess: (article) => {
    emit('update', article)
    responseToast.showSuccess('Article updated')
    model.value = false // Close the modal
  },
  onError: (err) => {
    responseToast.showError('Failed to update article', err)
  }
})

</script>