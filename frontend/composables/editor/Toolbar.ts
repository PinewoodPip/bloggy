/**
 * Exposes toolbar model data.
 */
import * as Editor from './Editor'
import * as HistoryActions from './action/History'
import * as FormattingActions from './action/Formatting'
import * as SectioningActions from './action/Sectioning'
import type { Action } from './action/Action'
import type { ToolbarGroupActionMenu, actionID } from './Editor'

export const useEditor = () => {
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

  // Sectioning blocks
  editor.registerAction(new SectioningActions.InsertHorizontalRule())
  // Creating heading actions
  const headingActions: Action[] = []
  const headingActionIDs: actionID[] = []
  for (let i = 1; i <= 6; ++i) {
    const action = new SectioningActions.SetHeading(i)
    editor.registerAction(action)
    headingActions.push(action)
    headingActionIDs.push(action.def.id)
  }
  editor.registerToolbarGroup({
    name: 'Sectioning',
    items: [
      {
        type: 'actionMenu',
        icon: 'i-material-symbols-h-mobiledata-badge-outline',
        name: 'Set Heading',
        actionIDs: headingActionIDs,
      } as ToolbarGroupActionMenu,
      {
        type: 'action',
        actionID: SectioningActions.InsertHorizontalRule.ID,
      } as Editor.ToolbarGroupAction
    ],
  })

  // Set default keybinds
  for (const action of Object.values(editor.actions)) {
    const actionID = action.def.id
    const defaultKeybind = editor.getAction(actionID).getDefaultKeyCombo()
    editor.setActionKeybind(actionID, defaultKeybind)
  }

  return editor
}

