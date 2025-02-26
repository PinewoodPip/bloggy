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
</template>

<script setup lang="ts">
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'
import { EditorState, Transaction } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import * as Editor from '../../composables/editor/Editor'
import { useEditor } from '~/composables/editor/Toolbar'

const editorRef = useTemplateRef('documentRef')

const editor = useEditor()

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
  // TODO
}

function saveDocument() {
  // TODO
}

function saveDraft() {
  // TODO
}

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
  return editor.getActionForKeyCombo(keyCombo)
}

/** Returns whether a key combo is bound to any action. */
function isKeyComboBound(keyCombo: Editor.actionID) {
  return getKeyComboAction(keyCombo) !== null
}

// Generate all possible modifier+key combinations
// TODO allow 2 modifiers?
let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
let symbols = ';\'\",./?=+`\\'.split('')
let specialKeys = [' ', 'enter', 'tab']
let allKeys = [...alphabet, ...symbols, ...specialKeys]
let modifiers = ['ctrl', 'alt', 'shift', '']
let shortcutEntries: {[key: string]: object} = {} // TODO import type - but from where?
for (const modifier of modifiers) {
  for (const key of allKeys) {
    const nuxtKeyComboID = modifier === '' ? key : `${modifier}_${key}`
    const shortcutEntry = {
      usingInput: true,
      whenever: [() => {return isKeyComboBound(nuxtKeyComboID)}],
      handler: () => {
        const action = getKeyComboAction(nuxtKeyComboID)
        console.log('combo:', nuxtKeyComboID, 'action:', action?.def.name)
        if (action) {
          onActionUsed(action)
        }
      }, 
    }
    shortcutEntries[nuxtKeyComboID] = shortcutEntry
  }
}

// @ts-ignore The type used is not exported from Nuxt UI.
defineShortcuts(shortcutEntries)

</script>