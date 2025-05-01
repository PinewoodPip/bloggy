/**
 * Implements document history-related actions; redo, undo, etc.
 */
import { redo as redoCommand, undo as undoCommand } from 'prosemirror-history'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { keybind } from '../Editor'
import type { ToolGroup, ActionTool } from '../ToolManager'
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