/**
 * Editor tool definitions for managing document history (undo, redo).
 */

import * as Editor from '~/src/editor/Editor'
import * as HistoryActions from '~/src/editor/actions/History'
import { RegisterActionTool } from "./Generic"

/** Registers tools for undo & redo. */
export const RegisterHistoryActions = (editor: Editor.Editor) => {
  const undoAction = new HistoryActions.Undo()
  const redoAction = new HistoryActions.Redo()
  const undoTool = RegisterActionTool(editor, undoAction, {
    name: 'Undo',
    icon: 'i-heroicons-arrow-uturn-left-solid',
  })
  const redoTool = RegisterActionTool(editor, redoAction, {
    name: 'Redo',
    icon: 'i-heroicons-arrow-uturn-right-solid',
  })

  return { undoTool, redoTool }
}