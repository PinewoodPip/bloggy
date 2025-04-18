import type { Editor } from "~/src/editor/Editor"

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
  provide<Ref<Editor.Editor>>('editor', editor)
  provide('editorView', editorView)
  provide('editorState', editorState)
}