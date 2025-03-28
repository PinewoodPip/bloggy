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
    <EditorToolbar v-if="editorState" @action-use="onActionUsed"/>

    <!-- Content area -->
    <div class="flex gap-x-2">
      <!-- Sidebar -->
      <div v-if="sidebarVisible" class="large-content-block">
        TODO
      </div>

      <!-- Document -->
      <div class="large-content-block flex-grow" @contextmenu.prevent="onContextMenu">
        <ProsemirrorAdapterProvider v-if="articleData">
          <EditorDocument ref="documentRef" :initial-content="articleData.content" />
        </ProsemirrorAdapterProvider>
        <LoadingSpinner v-else />
      </div>
    </div>
  </UContainer>

  <!-- Context menu -->
  <ContextMenu v-model="contextMenuOpen" :items="contextMenuItems" />

  <!-- Settings menu modal -->
  <UModal v-model="settingsMenuVisible" :overlay="true">
    <EditorSettings @rebind="onKeybindRebound" @close="settingsMenuVisible = false"/>
  </UModal>

  <!-- Metadata modal -->
  <AdminContentArticleEditModal v-if="articleData" v-model="documentPropertiesVisible" :article="articleData" :category-path="articleData.category_path" @update="onMetadataUpdated" />

  <!-- Footnote modal -->
  <EditorModalFootnote ref="footnoteModal" @confirm="onConfirmFootnote" />

  <!-- Link modal -->
  <EditorModalLink ref="linkModal" @confirm="onLinkEdited" />

  <!-- Hotlink image modal -->
  <EditorModalHotlinkImage ref="hotlinkImageModal" @confirm="onImageEdited" />

  <!-- Upload image modal -->
  <AdminFileUploadModal ref="imageUploadModal" @create="onImageUploaded" />
</template>

<script setup lang="ts">
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'
import { EditorState } from 'prosemirror-state'
import { Node } from 'prosemirror-model'
import type { EditorView } from 'prosemirror-view'
import * as Editor from '~/src/editor/Editor'
import ContextMenu from '~/components/context-menu/ContextMenu.vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import * as WidgetActions from '~/src/editor/actions/Widgets'
import { schema } from '~/src/editor/Schema'
import type { ImageAttrs } from '~/src/editor/Editor'

const editorRef = useTemplateRef('documentRef')
const articleService = useArticleService()
const responseToast = useResponseToast()
const emitter = useGlobalEvents()
const router = useRouter()
const route = useRoute()

const editor = ref(useArticleEditor())
const linkModal = useTemplateRef('linkModal')
const imageUploadModal = useTemplateRef('imageUploadModal')
const hotlinkImageModal = useTemplateRef('hotlinkImageModal')
const footnoteModal = useTemplateRef('footnoteModal')

const settingsMenuVisible = ref(false)
const documentPropertiesVisible = ref(false)
const sidebarVisible = ref(true)
const contextMenuOpen = ref(false)

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

function onLinkEdited(linkAttrs: Editor.LinkAttrs) {
  executeAction('FormatLink', linkAttrs)
}

function onImageEdited(imgAttrs: ImageAttrs) {
  executeAction('InsertImage', imgAttrs)
}

/** Execute action commands */
function onActionUsed(action: Editor.IAction) {
  if (editorRef.value) {
    const editorRaw = toRaw(editorRef.value)
    const view = toRaw(editorRaw.editorView)
    const state = view?.state
    
    if (state) {
      if (action.def.id == 'FormatLink') {
        const nodeRange = ProseMirrorUtils.getNodeRange(state)
        const node = nodeRange.$from.node()

        // Search for a link within the node
        let linkAttrs: Editor.LinkAttrs | undefined = undefined
        for (const mark of node.marks) {
          if (mark.type == schema.marks.link) {
            linkAttrs = mark.attrs as Editor.LinkAttrs
            break
          }
        }

        linkModal.value!.open(linkAttrs)
      } else if (action.def.id == 'HotlinkImage') {
        hotlinkImageModal.value!.open()
      } else if (action.def.id == 'UploadImage') {
        imageUploadModal.value!.open()
      } else {
        executeAction(action.def.id)
      }
    }
  }
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
  const state = toRaw(editorRef.value!.editorState!)
  const markdownStr = editor.value.serializeDocument(state)
  console.log('Serialized document')
  console.log(markdownStr)
  requestPatchArticle({
    title: articleMetadata.title,
    content: markdownStr.length > 0 ? markdownStr : ' ', // Backend requires the string to be non-empty.
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

function onMetadataUpdated(article: Article) {
  // If the filename was changed, the route needs to be updated so we don't get kicked out of the editor due to a 404 on refetch.
  router.replace('/admin/editor?article=' + article.path).then(() => {
    refetchArticleMetadata()
  })
}

function onKeybindRebound(actionID: Editor.actionID, keybind: Editor.keybind | null) {
  // Clear keybind of the previous action bound to it
  if (keybind) {
    const previousAction = editor.value.getActionForKeybind(keybind)
    if (previousAction) {
      editor.value.setActionKeybind(previousAction.def.id, null)
    }
  }
  // Set new keybind
  editor.value.setActionKeybind(actionID, keybind)

  // Persist settings
  editor.value.savePreferences("ArticleEditor")
}

function onContextMenu() {
  contextMenuOpen.value = true
}

/** Load the user's editor preferences when editor initializes */
watchEffect(() => {
  editor.value.loadPreferences("ArticleEditor")
})

/** ProseMirror EditorView. */
const editorView = computed(() => {
  const editorRaw = toRaw(editorRef.value)
  const view = toRaw(editorRaw?.editorView) as EditorView
  return view
})

/** ProseMirror EditorState. */
const editorState = computed(() => {
  const editorRaw = toRaw(editorRef.value)
  const state = toRaw(editorRaw?.editorState) as EditorState
  return state
})

/** Returns the action bound to a key combination. */
function getKeyComboAction(keyCombo: Editor.actionID): Editor.IAction | null {
  return editor.value.getActionForKeybind(keyCombo)
}

/** Returns whether a key combo is bound to any action. */
function isKeyComboBound(keyCombo: Editor.actionID) {
  return getKeyComboAction(keyCombo) !== null
}

/** Executes an action over the current selection. */
function executeAction(actionID: string, params?: object) {
  const action = editor.value.getAction(actionID)
  const editorRaw = toRaw(editorRef.value)
  const view = toRaw(editorRaw!.editorView)
  const state = toRaw(view?.state!)

  // Run action and apply transaction
  let transaction = action.execute(state, params)
  if (transaction) {
    Promise.resolve(transaction).then((a) => {
      toRaw(toRaw(editorRef.value)!.editorView)?.dispatch(a)
    })
  }
}

/**
 * Handle events from node renders.
 */
// @ts-ignore
emitter.on('editor.footnoteSelected', (node: Node) => {
  footnoteModal.value?.open({
    index: node.attrs.index,
    text: node.attrs.text,
  })
})
// @ts-ignore
emitter.on('editor.imageSelected', (node: Node) => {
  hotlinkImageModal.value!.open(node.attrs as ImageAttrs)
})

function onConfirmFootnote(attrs: Editor.FootnoteAttrs) {
  const state = toRaw(editorState.value)
  const view = toRaw(editorView.value)

  // Execute action
  const action = editor.value.getAction('InsertFootnote') as WidgetActions.InsertFootnote
  let tr = action.updateFootnote(state, attrs.index, attrs.text)
  if (tr) {
    view.dispatch(tr)
  }
}

function onImageUploaded(file: SiteFile) {
  executeAction('InsertImage', {src: '/files' + file.path})
}

function getActionContextMenuEntry(actionID: Editor.actionID): object {
  const action = editor.value.getAction(actionID)
  return {
    label: action.def.name,
    icon: action.def.icon,
    click: () => {executeAction(action.def.id)},
  }
}

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

/** Options shown in the context menu. */
const contextMenuItems = computed(() => {
  const items: object[][] = []
  // Add clipboard actions
  items.push(
    [
      getActionContextMenuEntry('ClipboardCopy'),
      getActionContextMenuEntry('ClipboardPaste'),
    ],
  )
  return items
})

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

// Expose editor state to all child components
// @ts-ignore
provide<Ref<Editor.Editor>>('editor', editor)
provide('editorView', editorView)
provide('editorState', editorState)

// TODO would be clearer to reader if this used an object
const shortcutEntries = useArbitraryKeyshortcuts(
  (keys) => {
    const action = getKeyComboAction(keys)
    if (action) {
      onActionUsed(action)
    }
  },
  (keys) => {
    return isKeyComboBound(keys)
  },
)
// @ts-ignore The type used is not exported from Nuxt UI.
defineShortcuts(shortcutEntries)

</script>

<style lang="css" scoped>

.field-autosize {
  /* Auto-sizes input elements based on content */
  field-sizing: content;
}

</style>