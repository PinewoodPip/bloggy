/**
 * Implements document history-related actions; redo, undo, etc.
 */
import { redo as redoCommand, undo as undoCommand } from 'prosemirror-history'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { ActionGroup, keyCombo } from '../Editor'
import { Action } from './Action'

export class Undo extends Action {
  static override ID: string = 'Undo'

  constructor() {
    super({
      id: 'Undo',
      name: 'Undo',
      icon: 'i-heroicons-arrow-uturn-left-solid',
    })
  }

  execute(state: EditorState): Transaction | null {
    return this.getTransaction(undoCommand, state)
  }
  
  override getDefaultKeyCombo(): keyCombo | null {
    return 'ctrl_z' // Ctrl + Z
  }
}

export class Redo extends Action {
  static override ID: string = 'Redo'

  constructor() {
    super({
      id: 'Redo',
      name: 'Right',
      icon: 'i-heroicons-arrow-uturn-right-solid',
    })
  }

  execute(state: EditorState): Transaction | null {
    return this.getTransaction(redoCommand, state)
  }

  override getDefaultKeyCombo(): keyCombo | null {
    return 'ctrl_y' // Ctrl + Y
  }
}

export const actionGroup: ActionGroup = {
  name: 'History',
  actions: [
    Undo.ID,
    Redo.ID,
  ]
}