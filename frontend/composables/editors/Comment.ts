import * as Editor from '~/src/editor/Editor'
import * as HistoryActions from '~/src/editor/actions/History'
import * as FormattingActions from '~/src/editor/actions/Formatting'
import * as ClipboardActions from '~/src/editor/actions/Clipboard'

/**
 * An editor setup for writing article comments.
 * Features only minimal formatting.
 */
export const useCommentEditor = () => {
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
  // TODO remove?
  for (const action of FormattingActions.alignmentActions) {
    editor.registerAction(action)
  }
  toolbar.registerToolbarGroup(FormattingActions.actionGroup)

  // Clipboard actions
  editor.registerAction(new ClipboardActions.Copy())
  editor.registerAction(new ClipboardActions.Paste())
  toolbar.registerToolbarGroup(ClipboardActions.actionGroup)

  return editor
}