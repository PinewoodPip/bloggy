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

export const useArticleEditor = () => {
  // Create editor
  const editor: Editor.Editor = new Editor.Editor()

  // Add default actions and groups
  // History actions
  editor.registerAction(new HistoryActions.Undo())
  editor.registerAction(new HistoryActions.Redo())
  editor.registerToolbarGroup(HistoryActions.actionGroup)

  // Formatting actions
  editor.registerAction(new FormattingActions.FormatBold())
  editor.registerAction(new FormattingActions.FormatItalic())
  editor.registerAction(new FormattingActions.FormatUnderline())
  editor.registerAction(new FormattingActions.FormatInlineCode())
  editor.registerToolbarGroup(FormattingActions.actionGroup)

  // Sectioning actions
  for (const action of SectioningActions.headingActions) {
    editor.registerAction(action)
  }
  editor.registerAction(new SectioningActions.InsertHorizontalRule())
  editor.registerAction(new SectioningActions.MakeQuote())
  editor.registerToolbarGroup(SectioningActions.actionGroup)

  // Clipboard actions
  editor.registerAction(new ClipboardActions.Copy())
  editor.registerAction(new ClipboardActions.Paste())
  editor.registerToolbarGroup(ClipboardActions.actionGroup)

  // List actions
  editor.registerAction(new ListActions.ToggleBulletList())
  editor.registerAction(new ListActions.ToggleNumberedList())
  editor.registerToolbarGroup(ListActions.actionGroup)

  // Widget actions
  editor.registerAction(new WidgetActions.InsertCodeBlock())
  for (const action of WidgetActions.alertActions) {
    editor.registerAction(action)
  }
  editor.registerAction(new WidgetActions.InsertFootnote())
  editor.registerToolbarGroup(WidgetActions.actionGroup)

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
  const editorState = inject<Ref<EditorState>>('editorState')!

  return {editor, editorState}
}
