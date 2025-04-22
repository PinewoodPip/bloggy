import type { Editor } from "~/src/editor/Editor"
import * as Toolbar from "~/src/editor/Toolbar"
import { injectLocal, provideLocal } from '@vueuse/core'

/** Exposes editor state to all child components. */
export const useEditorProvides = (editor: Editor, document: Ref<Component>): void => {
  const editorView = computed(() => {
    // @ts-ignore
    return document.value?.editorView
  })
  const editorState = computed(() => {
    // @ts-ignore
    return document.value?.editorState
  })

  const itemUsedCallbacks: Ref<Toolbar.ItemUsedCallback[]> = ref([])
  
  // @ts-ignore
  provideLocal<Ref<Editor.Editor>>('editor', editor)
  provideLocal('editorView', editorView)
  provideLocal('editorState', editorState)
  provideLocal('itemUsedCallbacks', itemUsedCallbacks)
  provideLocal('documentSchema', editor.schema)
}