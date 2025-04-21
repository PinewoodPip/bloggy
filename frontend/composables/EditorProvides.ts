import type { Editor } from "~/src/editor/Editor"
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
  
  // @ts-ignore
  provideLocal<Ref<Editor.Editor>>('editor', editor)
  provideLocal('editorView', editorView)
  provideLocal('editorState', editorState)
}