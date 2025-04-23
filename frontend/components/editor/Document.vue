<!-- Editor text area component, with context menu and widget modals support. -->
<template>
  <ProsemirrorAdapterProvider>
    <EditorProseMirrorWrapper ref="documentRef" :initial-content="initialContent" />
  </ProsemirrorAdapterProvider>

  <!-- Clipboard manager -->
  <EditorClipboardManager ref="clipboardManager" />
</template>

<script setup lang="ts">
import EditorDocumentContextMenu from '~/components/editor/DocumentContextMenu.vue'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'
import { EditorState } from 'prosemirror-state'
import { Node } from 'prosemirror-model'
import * as Editor from '~/src/editor/Editor'
import * as Toolbar from '~/src/editor/Toolbar'
import type { EditorView } from 'prosemirror-view'

const editorRef = useTemplateRef('documentRef')
const clipboardManager = useTemplateRef('clipboardManager')
const { editor, toolbar } = useEditorInjects()
const schema = useEditorSchema()

const props = defineProps<{
  initialContent: string,
}>();

/** Executes an action over the current selection. */
function executeAction(actionID: string, params?: object) {
  toRaw(editor.value).executeAction(actionID, params)
}

/** Execute action commands. */
function onActionUsed(item: Toolbar.GroupItem | Toolbar.actionGroupItemIdentifier) {
  if (editorRef.value) {
    const itemID = typeof item === 'string' ? item : item.id // String overload.
    const editorRaw = toRaw(editorRef.value)
    const view = toRaw(editorRaw.editorView)
    const state = view?.state
    if (state && editor.value.isAction(itemID)) {
      executeAction(itemID)
    }
  }
}
useEditorToolbarCallback((item) => {
  onActionUsed(item)
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

// Expose PM editor classes
defineExpose({
  editorView,
  editorState,
  onActionUsed,
})

/** Returns the action bound to a key combination. */
function getKeyComboAction(keyCombo: Editor.actionID): Editor.IAction | null {
  return editor.value.getItemForKeybind(keyCombo)
}

/** Returns whether a key combo is bound to any action. */
function isKeyComboBound(keyCombo: Editor.actionID) {
  return getKeyComboAction(keyCombo) !== null
}

// TODO would be clearer to reader if this used an object
const shortcutEntries = useArbitraryKeyshortcuts(
  (keys) => {
    const action = getKeyComboAction(keys)
    if (action) {
      onActionUsed(action.id)
    }
  },
  (keys) => {
    return isKeyComboBound(keys)
  },
)
// @ts-ignore The type used is not exported from Nuxt UI.
defineShortcuts(shortcutEntries)

</script>