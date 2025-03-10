<!-- Article editor page -->
<template>
  <UContainer class="flexcol gap-y-2">
    <!-- Header -->
    <div class="large-content-block flex">
      <!-- Document icon -->
      <UIcon name="i-material-symbols-article-outline" class="w-20 h-20"/>

      <!-- File path and menu -->
      <div class="flexcol">
        <h1>{{ fullPath }}</h1>

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
        <IconButton icon="i-material-symbols-save-outline" class="btn-smp btn-primary" @click="saveDocument">Publish</IconButton>
        <IconButton icon="i-heroicons-archive-box-arrow-down" class="btn-smp btn-primary" @click="saveDraft">Save draft</IconButton>
        <IconButton icon="i-heroicons-arrow-left-end-on-rectangle-solid" class="btn-smp btn-error" @click="saveDraft">Exit</IconButton>
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
      <div class="large-content-block flex-grow">
        <ProsemirrorAdapterProvider v-if="articleData">
          <EditorDocument ref="documentRef" :initial-content="articleData.content" />
        </ProsemirrorAdapterProvider>
        <LoadingSpinner v-else />
      </div>
    </div>
  </UContainer>

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
import { useEditor } from '~/composables/editor/Toolbar'
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

const editorRef = useTemplateRef('documentRef')
const articleService = useArticleService()
const responseToast = useResponseToast()
const router = useRouter()
const route = useRoute()

const editor = ref(useEditor())

const settingsMenuVisible = ref(false)
const sidebarVisible = ref(true)

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
function onActionUsed(action: Editor.IAction) {
  if (editorRef.value) {
    const editorRaw = toRaw(editorRef.value)
    const view = toRaw(editorRaw.editorView)
    const state = view?.state
    if (state) {
      const transaction: Transaction | null = action.execute(state)
      if (transaction) {
        view?.dispatch(transaction)
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

function saveDocument() {
  // TODO
}

function saveDraft() {
  // TODO
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

/** Load the user's editor preferences when editor initializes */
watchEffect(() => {
  editor.value.loadPreferences("ArticleEditor")
})

const fullPath = computed(() => {
  return 'TODO'
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

/** Query for fetching article metadata and initial content */
const { data: articleData, status: articleDataStatus } = useQuery({
  queryKey: ['articleContent'],
  queryFn: async () => {
    if (route.query['article']) {
      return await articleService.getArticle(route.query['article'] as string)
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