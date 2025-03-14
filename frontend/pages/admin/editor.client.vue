<!-- Article editor page -->
<template>
  <UContainer class="flexcol gap-y-2">
    <!-- Header -->
    <div class="large-content-block flex">
      <!-- Document icon -->
      <Icon icon="article-outline" class="w-20 h-20"/>

      <!-- File path and menu -->
      <div class="flexcol">
        <!-- Title and path -->
        <div class="pt-3 pl-3">
          <span class="flex items-center">
            <!-- Title field -->
            <input class="field-autosize bg-transparent font-bold text-lg min-w-16 px-2 mr-3" type="text" minlength="1" required v-model="articleMetadata.title" @focusout="onTitleFieldFocusOut" />

            <!-- Path -->
            <span class="flex items-center">
              <Icon icon="link" class="mr-2" />
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
    <EditorToolbar v-if="state" :editor="editor" :editor-view="editorView" :state="state" @action-use="onActionUsed"/>

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
    <EditorSettings :editor="editor" @rebind="onKeybindRebound" @close="settingsMenuVisible = false"/>
  </UModal>
</template>

<script setup lang="ts">
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'
import { EditorState, Transaction } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import * as Editor from '~/composables/editor/Editor'
import ContextMenu from '~/components/context-menu/ContextMenu.vue'
import { useEditor } from '~/composables/editor/Toolbar'
import { useMutation, useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import { DocumentSerializer } from '~/src/editor/markdown/Serializer'

const editorRef = useTemplateRef('documentRef')
const articleService = useArticleService()
const responseToast = useResponseToast()
const router = useRouter()
const route = useRoute()

const editor = ref(useEditor())

const settingsMenuVisible = ref(false)
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

/** Execute action commands */
async function onActionUsed(action: Editor.IAction) {
  if (editorRef.value) {
    const editorRaw = toRaw(editorRef.value)
    const view = toRaw(editorRaw.editorView)
    const state = view?.state
    if (state) {
      executeAction(action.def.id)
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
  const markdownStr = DocumentSerializer.serialize(editorRef.value!.editorState!.doc)
  requestPatchArticle({
    title: articleMetadata.title,
    content: markdownStr,
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

function editDocumentProperties() {
  // TODO
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
const state = computed(() => {
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
async function executeAction(actionID: string) {
  const action = editor.value.getAction(actionID)
  const editorRaw = toRaw(editorRef.value)
  const view = toRaw(editorRaw!.editorView)
  const state = view?.state!

  // Run action and apply transaction
  action.execute(toRaw(editorRef.value!).editorState!)
  const transaction: Transaction | null = await action.execute(state)
  if (transaction) {
    view?.dispatch(transaction)
  }
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
const { data: articleData, status: articleDataStatus } = useQuery({
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