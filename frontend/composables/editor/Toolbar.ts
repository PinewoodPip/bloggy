/**
 * Exposes toolbar model data.
 */
import * as Editor from './Editor'
import * as HistoryActions from './action/History'
import * as FormattingActions from './action/Formatting'

export const useEditor = () => {
  // Create editor
  const editor: Editor.Editor = new Editor.Editor()

  // Add default actions and groups
  // History actions
  editor.registerAction(new HistoryActions.Undo())
  editor.registerAction(new HistoryActions.Redo())
  editor.registerActionGroup(HistoryActions.actionGroup)

  // Formatting actions
  editor.registerAction(new FormattingActions.FormatBold())
  editor.registerAction(new FormattingActions.FormatItalic())
  editor.registerAction(new FormattingActions.FormatUnderline())
  editor.registerAction(new FormattingActions.FormatInlineCode())
  editor.registerActionGroup(FormattingActions.actionGroup)

  // Set default keybinds
  for (const group of editor.actionGroups) {
    for (const actionID of group.actions) {
      const defaultKeybind = editor.getAction(actionID).getDefaultKeyCombo()
      editor.setActionKeybind(actionID, defaultKeybind)
    }
  }

  return editor
}

