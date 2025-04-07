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

      <!-- Tags -->
      <FormGroupMultiselect v-model="chosenTags" :options="tagOptions" :multiple="true" track-by="name" option-label-key="name" label="Tags" help="Categorizes the article thematically." :show-labels="true" :searchable="true" placeholder="Select tags" aria-label="select tags" @search-change="onTagSearchChanged" />
    </template>

    <template #footer>
      <MutationButton class="btn-primary" icon="i-material-symbols-edit-document" :status="patchStatus" :disabled="!canConfirm" @click="confirm">Save</MutationButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query';
import type { ModelRef, Reactive } from 'vue';
import type { Tag } from '~/services/article';

const articleService = useArticleService()
const responseToast = useResponseToast()
const { data: editors, status: editorsStatus } = useEditors()
const { data: allTags } = useSiteTags()

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
  tags: [],
  // TODO category path, sorting index
  // category_sorting_index: 0,
})
const chosenAuthors: Ref<User[]> = ref([])
const publishDate: Ref<string | undefined> = ref(undefined)
const chosenTags: Ref<Tag[]> = ref([])
/** Used to insert options into the multiselect dynamically */
const newDummyTag: Reactive<Tag> = reactive({
  id: -1,
  name: '',
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
  requestPatch({
    ...articleData,
    authors: chosenAuthors.value.map((author) => author.username),
    tags: chosenTags.value.map((tag) => tag.name),
    publish_time: utcDateStr.value!,
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
    articleData.tags = article.tags
    chosenAuthors.value = article.authors
    publishDate.value = article.publish_time ? article.publish_time : undefined
  }
})

// Update chosen tags model when list of tags changes
watch(allTags, () => {
  if (allTags.value) {
    chosenTags.value = allTags.value?.tags.filter((tag) => {
      return props.article.tags.includes(tag.name)
    })
  }
})

/** Update dummy tag with the search query */
function onTagSearchChanged(query: string) {
  newDummyTag.name = query
}

/** Tags visible in the multiselect dropdown */
const tagOptions = computed(() => {
  const tags = [...allTags.value?.tags || []]

  // Add new tag option if the search query doesn't match any existing one
  if (!tags.find((tag) => tag.name === newDummyTag.name)) {
    tags.push(Object.assign({}, newDummyTag))
  }

  return tags
})

/* UTC ISO date string of the publish time. */
const utcDateStr = computed(() => {
  if (publishDate.value) {
    let date = new Date(publishDate.value);
    return date.toISOString()
  } else {
    return null
  }
})

/** Mutation for creating the article */
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