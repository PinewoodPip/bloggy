<template>
  <FullscreenModal v-model="model" :can-confirm="canConfirm" :confirm-callback="confirm">
    <template #headerTitle>
      <h2>Create article</h2>
    </template>

    <template #form>
      <!-- Category -->
      <FormGroupArticle v-model="categoryPath" type="category" label="Category" hint="Category the article will be created in." icon="material-symbols:folder" />
      
      <!-- Title -->
      <FormGroupInputField v-model="articleData.title" label="Title" icon="i-material-symbols-title" :required="true" />
      
      <!-- Filename -->
      <!-- TODO preview path in help -->
      <FormGroupInputField v-model="articleData.filename" label="File name" hint="Determines the URL of the article." icon="i-material-symbols-link" :required="true" />
    </template>

    <template #footer>
      <MutationButton class="btn-primary" icon="i-material-symbols-article-rounded" :status="creationStatus" :disabled="!canConfirm" @click="confirm">Create</MutationButton>
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
}>()

const emit = defineEmits<{
  create: [Article],
}>()

const model: ModelRef<boolean> = defineModel({
  default: false,
})

const articleData: Reactive<ArticleCreationRequest> = reactive({
  filename: '',
  title: '',
  content: ' ',
  summary: '',
  text: '',
})
const categoryPath = ref('')

function confirm() {
  requestCreation(articleData)
}

const canConfirm = computed(() => {
  return true // TODO validate fields
})

// Reset field values when the category prop is set
watchEffect(() => {
  if (props.categoryPath) {
    articleData.filename = ''
    articleData.title = ''
    articleData.content = ' '
    categoryPath.value = props.categoryPath
  }
})

/** Query for creating the article */
const { mutate: requestCreation, status: creationStatus } = useMutation({
  mutationFn: (request: ArticleCreationRequest) => {
    return articleService.createArticle((categoryPath.value === '/' ? '' : categoryPath.value) + '/' + request.filename, request)
  },
  onSuccess: (article) => {
    emit('create', article)
    responseToast.showSuccess('Article created')
    model.value = false // Close the modal
  },
  onError: (err) => {
    responseToast.showError('Failed to create article', err)
  }
})

</script>