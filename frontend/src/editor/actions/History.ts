/**
 * Implements document history-related actions; redo, undo, etc.
 */
import { redo as redoCommand, undo as undoCommand } from 'prosemirror-history'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { keybind } from '../Editor'
import type { Group, GroupAction } from '../Toolbar'
import { Action } from './Action'

export class Undo extends Action {
  static ID: string = 'Undo'

  constructor() {
    super(Undo.ID)
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    return this.getTransaction(undoCommand, state)
  }
  
  override getDefaultKeyCombo(): keybind | null {
    return 'ctrl_z' // Ctrl + Z
  }
}

export class Redo extends Action {
  static ID: string = 'Redo'

  constructor() {
    super(Redo.ID)
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    return this.getTransaction(redoCommand, state)
  }

  override getDefaultKeyCombo(): keybind | null {
    return 'ctrl_y' // Ctrl + Y
  }
}

export const actionGroup: Group = {
  name: 'History',
  items: [
    {
      type: 'action',
      id: Undo.ID,
      def: {
        name: 'Undo',
        icon: 'i-heroicons-arrow-uturn-left-solid',
      },
    } as GroupAction,
    {
      type: 'action',
      id: Redo.ID,
      def: {
        name: 'Redo',
        icon: 'i-heroicons-arrow-uturn-right-solid',
      },
    } as GroupAction,
  ]
}