/**
 * Composables for common editor configurations.
 */
import type { EditorState } from 'prosemirror-state';
import * as Editor from '~/src/editor/Editor'
import * as HistoryActions from '~/src/editor/actions/History'
import * as FormattingActions from '~/src/editor/actions/Formatting'
import * as SectioningActions from '~/src/editor/actions/Sectioning'
import * as ClipboardActions from '~/src/editor/actions/Clipboard'
import * as ListActions from '~/src/editor/actions/Lists'
import * as WidgetActions from '~/src/editor/actions/Widgets'
import * as MediaActions from '~/src/editor/actions/Media'

/** Creates an article editor model. */
export const useArticleEditor = () => {
  // Create editor
  const editor: Editor.Editor = new Editor.Editor()
  const toolbar = editor.getToolbar()

  // Add default actions and groups
  // History actions
  editor.registerAction(new HistoryActions.Undo())
  editor.registerAction(new HistoryActions.Redo())
  toolbar.registerToolbarGroup(HistoryActions.actionGroup)

  // Formatting actions
  editor.registerAction(new FormattingActions.FormatBold())
  editor.registerAction(new FormattingActions.FormatItalic())
  editor.registerAction(new FormattingActions.FormatUnderline())
  editor.registerAction(new FormattingActions.FormatInlineCode())
  editor.registerAction(new FormattingActions.FormatLink())
  for (const action of FormattingActions.alignmentActions) {
    editor.registerAction(action)
  }
  toolbar.registerToolbarGroup(FormattingActions.actionGroup)

  // Sectioning actions
  for (const action of SectioningActions.headingActions) {
    editor.registerAction(action)
  }
  editor.registerAction(new SectioningActions.InsertHorizontalRule())
  editor.registerAction(new SectioningActions.MakeQuote())
  toolbar.registerToolbarGroup(SectioningActions.actionGroup)

  // Clipboard actions
  editor.registerAction(new ClipboardActions.Copy())
  editor.registerAction(new ClipboardActions.Paste())
  toolbar.registerToolbarGroup(ClipboardActions.actionGroup)

  // Media actions
  editor.registerAction(new MediaActions.InsertImage())
  for (const action of MediaActions.imageActions) {
    editor.registerAction(action)
  }
  toolbar.registerToolbarGroup(MediaActions.actionGroup)

  // List actions
  editor.registerAction(new ListActions.ToggleBulletList())
  editor.registerAction(new ListActions.ToggleNumberedList())
  toolbar.registerToolbarGroup(ListActions.actionGroup)

  // Widget actions
  editor.registerAction(new WidgetActions.InsertCodeBlock())
  for (const action of WidgetActions.alertActions) {
    editor.registerAction(action)
  }
  editor.registerAction(new WidgetActions.InsertFootnote())
  toolbar.registerToolbarGroup(WidgetActions.actionGroup)

  // Set default keybinds
  for (const action of Object.values(editor.actions)) {
    const actionID = action.def.id
    const defaultKeybind = editor.getAction(actionID).getDefaultKeyCombo()
    editor.setActionKeybind(actionID, defaultKeybind)
  }

  return editor
}

/** Auxiliary composable to import editor injects. */
export const useEditorInjects = () => {
  const editor = inject<Ref<Editor.Editor>>('editor')!
  // Use computed to make contexts that use it reactive even if they don't use the editor itself
  const toolbar = computed(() => {
    return editor.value!.getToolbar()
  })
  const editorState = inject<Ref<EditorState>>('editorState')!

  return {editor, editorState, toolbar}
}
