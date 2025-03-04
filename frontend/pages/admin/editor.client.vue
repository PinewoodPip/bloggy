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
          <li><a @click="openFileMenu">File</a></li>
          <li><a @click="openViewMenu">View</a></li>
          <li><a @click="openSettingsMenu">Settings</a></li>
        </ul>
      </div>

      <HorizontalFill/>

      <!-- Session management buttons -->
      <div class="flex gap-x-2 my-auto">
        <IconButton icon="i-material-symbols-save-outline" class="btn-primary" @click="saveDocument">Publish</IconButton>
        <IconButton icon="i-heroicons-archive-box-arrow-down" class="btn-primary" @click="saveDraft">Save draft</IconButton>
        <IconButton icon="i-heroicons-arrow-left-end-on-rectangle-solid" class="btn-error" @click="saveDraft">Exit</IconButton>
      </div>
    </div>

    <!-- Toolbar; only rendered once editor is initialized -->
    <EditorToolbar v-if="state" :editor="editor" :editor-view="editorView" :state="state" @action-use="onActionUsed"/>

    <!-- Content area -->
    <div class="flex gap-x-2">
      <!-- Sidebar -->
      <div class="large-content-block">
        TODO
      </div>

      <!-- Document -->
      <div class="large-content-block flex-grow">
        <ProsemirrorAdapterProvider>
          <EditorDocument ref="documentRef"/>
        </ProsemirrorAdapterProvider>
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
import * as Editor from '../../composables/editor/Editor'
import { useEditor } from '~/composables/editor/Toolbar'

const editorRef = useTemplateRef('documentRef')

const editor = ref(useEditor())

const settingsMenuVisible = ref(false)

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

function onKeybindRebound(actionID: Editor.actionID, keybind: Editor.keyCombo | null) {
  // Clear keybind of the previous action bound to it
  if (keybind) {
    const previousAction = editor.value.getActionForKeybind(keybind)
    console.log("unbinding", previousAction)
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

// TODO would be clearer to reader if this used an object
const shortcutEntries = useArbitraryKeyshortcuts(
  (keys) => {
    const action = getKeyComboAction(keys)
    console.log('combo:', keys, 'action:', action?.def.name)
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