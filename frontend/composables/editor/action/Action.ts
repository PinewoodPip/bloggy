/**
 * Base class for editor actions.
 */
import type { MarkType } from 'prosemirror-model'
import type { Command, EditorState, NodeSelection, Transaction } from 'prosemirror-state'
import type { ActionDef, IAction, actionID, keyCombo } from '../Editor'

export abstract class Action implements IAction {
  static ID: actionID
  def: ActionDef

  constructor(def: ActionDef) {
    this.def = def
  }

  abstract execute(state: EditorState): Transaction | null

  isActive(state: EditorState): boolean {
    return false
  }

  getDefaultKeyCombo(): keyCombo | null {
    return null
  }

  /** Returns whether a mark is being stored or is used in the selection. */
  isMarkActive(state: EditorState, markType: MarkType): boolean {
    let {$from, from, to, empty} = state.selection as NodeSelection
    // If there is no selection, check whether the mark is toggled on
    if (empty) {
      return !!markType.isInSet(state.storedMarks || $from.marks())
    } else {
      // Check if the mark is used anywhere in the selection
      return state.doc.rangeHasMark(from === to ? from : from, to, markType) 
    }
  }

  /** Utility method to wrap the execution of a ProseMirror command. */
  getTransaction(command: Command, state: EditorState): Transaction | null {
    let transaction: Transaction | null = null
    command(state, (tr) => {
      transaction = tr
    })
    return transaction
  }
}
