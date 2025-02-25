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
    <EditorToolbar v-if="state" :editor="editor" :state="state" @action-use="onActionUsed"/>

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

const editorRef = useTemplateRef('documentRef')

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
const editor = computed(() => {
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

</script>