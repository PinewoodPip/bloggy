<!-- Displays basic article metadata and menu bar. -->
<template>
  <div class="small-content-block flex">
    <!-- Document icon -->
    <UIcon name="i-material-symbols-article-outline" class="w-20 h-20"/>

    <!-- File path and menu -->
    <div class="flexcol">
      <!-- Title and path -->
      <div class="pt-3 pl-3">
        <span class="flex items-center">
          <!-- Title field -->
          <span class="min-w-10 font-bold text-lg px-2 mr-3" ref="titleField" contenteditable="true" @focusout="onTitleFieldFocusOut">{{ articlePatchData.title }}</span> <!-- Contenteditable does not support v-model -->

          <!-- Path -->
          <span class="flex items-center">
            <UIcon name="i-material-symbols-link" class="mr-2" />
            <RouterLink :to="publishedArticlePath" target="_blank" class="hover:link link-neutral">
              <code class="text-base-content/80">{{ article?.path }}</code>
            </RouterLink>
          </span>
        </span>
      </div>

      <VerticalFill/>

      <!-- Menu button links -->
      <ul class="menu menu-horizontal flex-row bg-base-200">
        <li v-for="subitem in menuItemGroup.subitems" :key="subitem.id" class="flex items-center">
          <ArticleEditorMenuItemButton :item="subitem" />
        </li>
      </ul>
    </div>

    <HorizontalFill/>

    <!-- Session management buttons -->
    <div class="flex gap-x-2 my-auto">
      <!-- Save button -->
      <div class="join">
        <!-- The actual save button -->
        <MutationButton :icon="saveBtnMode === 'publish' ? 'i-material-symbols-save-outline' : 'i-heroicons-archive-box-arrow-down'" class="join-item btn-smp btn-primary" :status="articleMutation.status.value" @click="saveArticle()">{{ saveBtnMode === 'publish' ? 'Publish' : 'Save draft' }}</MutationButton>
        
        <!-- Save mode dropdown -->
        <div class="dropdown dropdown-bottom dropdown-end join-item">
          <!-- Chevron -->
          <div tabindex="0" role="button" aria-label="Change article save mode" class="btn-smp btn-outline btn btn-primary join-item">
            <UIcon name="material-symbols:arrow-drop-down" />
          </div>
          <!-- Content -->
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li @click="saveBtnMode = 'publish'"><a>Publish to site</a></li>
            <li @click="saveBtnMode = 'draft'"><a>Save as draft</a></li>
          </ul>
        </div>
      </div>

      <!-- Exit button -->
      <IconButton icon="i-heroicons-arrow-left-end-on-rectangle-solid" class="btn-smp btn-error" @click="exit">Exit</IconButton>
    </div>
  </div>

  <!-- Settings menu modal -->
  <UModal v-model="settingsMenuVisible" :overlay="true">
    <ArticleEditorModalSettings @close="settingsMenuVisible = false"/>
  </UModal>

  <!-- Metadata modal -->
  <AdminContentArticleEditModal v-if="article" v-model="documentPropertiesVisible" :article="article" :category-path="article.category_path" @update="onMetadataUpdated" />
</template>

<script setup lang="ts">
import { ArticleEditorModalSettings } from '#components'
import type { Reactive } from 'vue'

const router = useRouter()
const articleService = useArticleService()
const { articleMutation, saveDocument, validateMetadata, articleQuery } = useArticleEditorQueries()
const { itemGroup: menuItemGroup } = useArticleEditorMainMenu()
const titleField = useTemplateRef('titleField')

const props = defineProps<{
  article: Article | undefined | null,
}>();


const articlePatchData: Reactive<ArticleUpdateRequest> = reactive({
  title: '',
})

const emit = defineEmits<{
  toggleSidebar: [],
  exit: [],
  metadataUpdated: [Article],
}>();

const settingsMenuVisible = ref(false)
const documentPropertiesVisible = ref(false)
const saveBtnMode = ref('publish')

/** Requests to patch the article title if it was changed. */
function onTitleFieldFocusOut() {
  const title = titleField.value?.textContent
  if (title !== props.article?.title && title) {
    articlePatchData.title = title || props.article!.title 
    validateMetadata(articlePatchData)
    articleMutation.mutate(articlePatchData)
  } else {
    titleField.value!.textContent = props.article!.title // Reset the field to the new title; this will also undo invalid title changes
  }
}

/** Saves the article to the CMS. */
function saveArticle(isDraft?: boolean) {
  // Other document data is added by the composable
 saveDocument({
    is_draft: isDraft ?? saveBtnMode.value === 'draft',
  })
}

function toggleMarkdownView() {
  // TODO
}

function toggleTableOfContents() {
  emit('toggleSidebar')
}

/** Opens the metadata editor. */
function editDocumentProperties() {
  documentPropertiesVisible.value = true
}

/** Saves the document as a draft and returns to the admin panel. */
function exit() {
  emit('exit')
  saveArticle(true) // Save draft first
  router.push('/admin/content')
}

function onMetadataUpdated(article: Article) {
  emit('metadataUpdated', article)
}

const publishedArticlePath = computed(() => {
  const path = props.article?.path
  return path ? CMSUtils.resolveArticlePath(path) : ''
})

// Re-initialize fields when article is updated
watchEffect(() => {
  if (props.article) {
    // Update title
    articlePatchData.title = props.article.title

    // Set default save mode based on article publishing state
    saveBtnMode.value = articleService.isPublished(props.article) ? 'publish' : 'draft'
  }
})

// Handle item events
useEditorToolCallback((item) => {
  switch (item.id) {
    case 'Document.File.Save':
      saveDocument({}) // Document data is added by the composable
      break
    case 'Document.File.SaveDraft':
      saveArticle(true)
      break
    case 'Document.Properties':
      editDocumentProperties()
      break
    case 'Document.View.Markdown':
      toggleMarkdownView()
      break
    case 'Document.View.TableOfContents':
      toggleTableOfContents()
      break
    case 'Document.Settings':
      settingsMenuVisible.value = true
      break
  }
})

</script>