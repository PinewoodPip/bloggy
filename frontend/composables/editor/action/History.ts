/**
 * Implements document history-related actions; redo, undo, etc.
 */
import { redo as redoCommand, undo as undoCommand } from 'prosemirror-history'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { ActionGroup } from '../Editor'
import { Action } from './Action'

class Undo extends Action {
  constructor() {
    super({
      name: 'Undo',
      icon: 'i-heroicons-arrow-uturn-left-solid',
    })
  }

  execute(state: EditorState): Transaction | null {
    return this.getTransaction(undoCommand, state)
  }
}

class Redo extends Action {
  constructor() {
    super({
      name: 'Right',
      icon: 'i-heroicons-arrow-uturn-right-solid',
    })
  }

  execute(state: EditorState): Transaction | null {
    return this.getTransaction(redoCommand, state)
  }
}

const actionGroup: ActionGroup = {
  name: 'History',
  actions: [
    new Undo(),
    new Redo(),
  ]
}
export default actionGroup