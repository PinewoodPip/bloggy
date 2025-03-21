/**
 * Implements document history-related actions; redo, undo, etc.
 */
import { redo as redoCommand, undo as undoCommand } from 'prosemirror-history'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { ToolbarGroup, ToolbarGroupAction, keybind } from '../Editor'
import { Action } from './Action'

export class Undo extends Action {
  static override ID: string = 'Undo'

  constructor() {
    super({
      id: Undo.ID,
      name: 'Undo',
      icon: 'i-heroicons-arrow-uturn-left-solid',
    })
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    return this.getTransaction(undoCommand, state)
  }
  
  override getDefaultKeyCombo(): keybind | null {
    return 'ctrl_z' // Ctrl + Z
  }
}

export class Redo extends Action {
  static override ID: string = 'Redo'

  constructor() {
    super({
      id: Redo.ID,
      name: 'Redo',
      icon: 'i-heroicons-arrow-uturn-right-solid',
    })
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    return this.getTransaction(redoCommand, state)
  }

  override getDefaultKeyCombo(): keybind | null {
    return 'ctrl_y' // Ctrl + Y
  }
}

export const actionGroup: ToolbarGroup = {
  name: 'History',
  items: [
    {type: 'action', actionID: Undo.ID} as ToolbarGroupAction,
    {type: 'action', actionID: Redo.ID} as ToolbarGroupAction,
  ]
}