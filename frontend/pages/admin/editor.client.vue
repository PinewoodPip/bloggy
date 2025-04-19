<!-- Article editor page -->
<template>
  <UContainer class="flexcol gap-y-2">
    <!-- Header -->
    <div class="large-content-block flex">
      <!-- Document icon -->
      <UIcon name="i-material-symbols-article-outline" class="w-20 h-20"/>

      <!-- File path and menu -->
      <div class="flexcol">
        <!-- Title and path -->
        <div class="pt-3 pl-3">
          <span class="flex items-center">
            <!-- Title field -->
            <input class="field-autosize bg-transparent font-bold text-lg min-w-16 px-2 mr-3" type="text" minlength="1" required v-model="articleMetadata.title" @focusout="onTitleFieldFocusOut" />

            <!-- Path -->
            <span class="flex items-center">
              <UIcon name="i-material-symbols-link" class="mr-2" />
              <code class="text-base-content/80">{{ articleData?.path }}</code>
            </span>
          </span>
        </div>

        <VerticalFill/>

        <!-- Menu button links -->
        <ul class="menu menu-horizontal flex-row bg-base-200">
          <!-- File menu -->
          <li>
            <Dropdown :items="fileDropdownItems">
              <UButton label="File" />
            </Dropdown>
          </li>
          <!-- View menu -->
          <li>
            <Dropdown :items="viewDropdownItems">
              <UButton label="View" />
            </Dropdown>
          </li>
          <!-- Settings menu; opens a modal instead -->
          <li><a @click="openSettingsMenu">Settings</a></li>
        </ul>
      </div>

      <HorizontalFill/>

      <!-- Session management buttons -->
      <div class="flex gap-x-2 my-auto">
        <MutationButton icon="i-material-symbols-save-outline" class="btn-smp btn-primary" :status="patchArticleStatus" @click="saveDocument">Publish</MutationButton>
        <IconButton icon="i-heroicons-archive-box-arrow-down" class="btn-smp btn-primary" @click="saveDraft">Save draft</IconButton>
        <IconButton icon="i-heroicons-arrow-left-end-on-rectangle-solid" class="btn-smp btn-error" @click="exit">Exit</IconButton>
      </div>
    </div>

    <!-- Toolbar; only rendered once editor is initialized -->
    <EditorToolbar v-if="editorDocument?.editorState" @action-use="onActionUsed"/>

    <!-- Content area -->
    <div class="flex gap-x-2">
      <!-- Sidebar -->
      <div v-if="sidebarVisible" class="large-content-block max-w-md">
        <EditorSidebar @heading-selected="onHeadingSelected" />
      </div>

      <!-- Document -->
      <EditorDocument v-if="articleData" ref="document" :initial-content="articleData.content" />
      <LoadingSpinner v-else />
    </div>

    <!-- Status bar -->
    <EditorStatusBar class="fixed left-0 bottom-0 w-full" />
  </UContainer>

  <!-- Settings menu modal -->
  <UModal v-model="settingsMenuVisible" :overlay="true">
    <EditorSettings @rebind="onKeybindRebound" @close="settingsMenuVisible = false"/>
  </UModal>

  <!-- Metadata modal -->
  <AdminContentArticleEditModal v-if="articleData" v-model="documentPropertiesVisible" :article="articleData" :category-path="articleData.category_path" @update="onMetadataUpdated" />
</template>

<script setup lang="ts">
import type * as Toolbar from '~/src/editor/Toolbar'
import * as Editor from '~/src/editor/Editor'
import { useMutation, useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import { Markdown } from '~/src/editor/markdown/Parser'
import * as cheerio from 'cheerio';
import type { Heading } from '~/components/editor/sidebar/Sidebar.vue'

const articleService = useArticleService()
const responseToast = useResponseToast()
const router = useRouter()
const route = useRoute()

const editor = ref(useArticleEditor())
const editorDocument = useTemplateRef('document')
useEditorProvides(editor, editorDocument)

const settingsMenuVisible = ref(false)
const documentPropertiesVisible = ref(false)
const sidebarVisible = ref(true)

const articleMetadata = reactive({
  title: '',
})

const fileDropdownItems = [
  [
    {
      label: 'Save & publish',
      icon: 'i-heroicons-book-open-16-solid',
      click: () => {
        saveDocument()
      }
    },
    {
      // TODO only show this option if unpublished
      label: 'Save as draft',
      icon: 'i-heroicons-pencil-square',
      click: () => {
        saveDraft()
      }
    },
    {
      label: 'Document properties',
      icon: 'i-heroicons-document-text',
      click: () => {
        editDocumentProperties()
      }
    },
  ]
]
const viewDropdownItems = [
  [
    {
      label: 'Markdown mode',
      icon: 'i-material-symbols-markdown-outline',
      click: () => {
        toggleMarkdownView()
      }
    },
    {
      label: 'Table of contents',
      icon: 'i-material-symbols-data-table-outline',
      click: () => {
        toggleTableOfContents()
      }
    },
  ]
]

/** Max amount of characters to use for auto-generated summaries. */
const MAX_SUMMARY_LENGTH = 250

function onActionUsed(item: Toolbar.GroupItem | Toolbar.actionGroupItemIdentifier) {
  editorDocument.value?.onActionUsed(item)
}

function openFileMenu() {
  // TODO
}

function openViewMenu() {
  // TODO
}

function openSettingsMenu() {
  settingsMenuVisible.value = true
}

/** Serializes the editor document and requests to patch the article. */
function saveDocument() {
  // Ensure fields are set to valid values first
  validateMetadata()

  // Serialize the document and PATCH the article
  const state = toRaw(editorDocument.value!.editorState!)
  const markdownStr = editor.value.serializeDocument(state)

  // Extract text without markdown markers
  const $ = cheerio.load(Markdown.render(markdownStr))
  const text = DOMUtils.extractText($)
  
  // Generate "summary"
  const summary = text.substring(0, MAX_SUMMARY_LENGTH)

  console.log('Serialized document')
  console.log(markdownStr)
  requestPatchArticle({
    title: articleMetadata.title,
    content: markdownStr.length > 0 ? markdownStr : ' ', // Backend requires the string to be non-empty.
    text: text,
    summary: summary,
  })
}

function saveDraft() {
  // TODO
}

/** Saves the document as a draft and returns to the admin panel. */
function exit() {
  saveDraft()
  router.push('/admin/content')
}

function toggleMarkdownView() {
  // TODO
}

function toggleTableOfContents() {
  sidebarVisible.value = !sidebarVisible.value
}

/** Opens the metadata editor. */
function editDocumentProperties() {
  documentPropertiesVisible.value = true
}

/** Selects and scrolls to a heading. */
function onHeadingSelected(heading: Heading) {
  const state = editorDocument.value?.editorState!
  const view = editorDocument.value?.editorView!
  const domTopPosition = view.coordsAtPos(heading.position).top;

  // Refocus the editor, else the selection will be discarded
  const dom = view.domAtPos(heading.position)
  // @ts-ignore
  dom.node.focus()

  // Select the node
  const selectionTr = ProseMirrorUtils.selectNode(state.tr, heading.position)
  view.dispatch(selectionTr)

  // Scroll to the heading
  document.querySelector('body')?.scrollTo({
    top: domTopPosition,
  })
}

function onMetadataUpdated(article: Article) {
  // If the filename was changed, the route needs to be updated so we don't get kicked out of the editor due to a 404 on refetch.
  router.replace('/admin/editor?article=' + article.path).then(() => {
    refetchArticleMetadata()
  })
}

function onKeybindRebound(itemID: Toolbar.actionGroupItemIdentifier, keybind: Editor.keybind | null) {
  // Clear keybind of the previous action bound to it
  if (keybind) {
    const previousAction = editor.value.getItemForKeybind(keybind)
    if (previousAction) {
      editor.value.setItemKeybind(previousAction.id, null)
    }
  }
  // Set new keybind
  editor.value.setItemKeybind(itemID, keybind)

  // Persist settings
  editor.value.savePreferences("ArticleEditor")
}

/** Load the user's editor preferences when editor initializes. */
watchEffect(() => {
  editor.value.loadPreferences("ArticleEditor")
})

/** 
 * Validates the metadata values and resets them if they're not valid.
 */
function validateMetadata() {
  // Reset the title field to the original fetched data if the user attempts to clear it.
  if (articleMetadata.title === '') {
    articleMetadata.title = articleData.value!.title
  }
}

function onTitleFieldFocusOut() {
  validateMetadata()
}

/** Query for fetching article metadata and initial content */
const { data: articleData, status: articleDataStatus, refetch: refetchArticleMetadata } = useQuery({
  queryKey: ['articleContent'],
  queryFn: async () => {
    if (route.query['article']) {
      const article = await articleService.getArticle(route.query['article'] as string)
      // Update metadata reactive
      articleMetadata.title = article.title
      return article
    } else {
      return null
    }
  },
  retry: (count, err) => {
    if ((err as AxiosError).status === 404) {
      // Redirect back to admin panel if the article URL is invalid
      responseToast.showError('Article not found')
      router.push('/admin/content') 
    } else if (count == 1) { // Show error on first failed fetch
      responseToast.showError('Failed to load article content', err)
    }
    return true
  }
})

/** Mutation for saving the article */
const { mutate: requestPatchArticle, status: patchArticleStatus } = useMutation({
  mutationFn: (patchData: ArticleUpdateRequest) => {
    return articleService.updateArticle((articleData.value as Article).path, patchData)
  },
  onSuccess: (article) => {
    responseToast.showSuccess('Article saved')
  },
  onError: (err) => {
    responseToast.showError('Failed to save article', err)
  }
})

</script>

<style lang="css" scoped>

.field-autosize {
  /* Auto-sizes input elements based on content */
  field-sizing: content;
}

</style>