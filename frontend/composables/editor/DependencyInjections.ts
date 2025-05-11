import type { Editor } from "~/src/editor/Editor"
import type { EditorState } from 'prosemirror-state'
import type { Schema } from 'prosemirror-model'
import type { EditorView } from 'prosemirror-view'
import * as Tools from "~/src/editor/ToolManager"
import { injectLocal, provideLocal } from '@vueuse/core'

/** Exposes editor state to all child components. */
export const useEditorProvides = (editor: Ref<Editor>, document: Ref<Component>): void => {
  const editorView = computed(() => {
    // @ts-ignore
    return document.value?.editorView
  })
  const editorState = computed(() => {
    // @ts-ignore
    return document.value?.editorState
  })

  const itemUsedCallbacks: Ref<Tools.ItemUsedCallback[]> = ref([])
  
  provideLocal<Ref<Editor>>('editor', editor)
  provideLocal('editorView', editorView)
  provideLocal('editorState', editorState)
  provideLocal('itemUsedCallbacks', itemUsedCallbacks)
  provideLocal('documentSchema', editor.value.schema)
}

/** Auxiliary composable to import editor injects. */
export const useEditorInjects = () => {
  const editor = injectLocal<Ref<Editor>>('editor')!
  // Use computed to make contexts that use it reactive even if they don't use the editor itself
  const tools = computed(() => {
    return editor.value!.getToolManager()
  })
  const editorState = injectLocal<Ref<EditorState>>('editorState')!
  const editorView = injectLocal<Ref<EditorView>>('editorView')!
  const itemUsedCallbacks = injectLocal<Ref<Tools.ItemUsedCallback[]>>('itemUsedCallbacks')!
  const schema = injectLocal<Schema>('documentSchema')!
  return { editor, tools, editorState, editorView, itemUsedCallbacks, schema }
}

/** Composable for the editor document's ProseMirror schema. */
export const useEditorSchema = () => {
  const { editor } = useEditorInjects()
  return editor.value.schema // Immutable; no reactivity necessary
}
