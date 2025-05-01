/**
 * Base class for editor actions.
 */
import type { Attrs, MarkType, NodeType, Node, NodeRange } from 'prosemirror-model'
import type { Command, EditorState, NodeSelection, Transaction } from 'prosemirror-state'
import type { ActionDef, IAction, actionID, keybind } from '../Editor'

export abstract class Action implements IAction {
  id: actionID

  constructor(id: string) {
    this.id = id
  }

  abstract execute(state: EditorState, params?: object): Transaction | Promise<Transaction> | null

  isActive(state: EditorState): boolean {
    return false
  }

  isApplicable(state: EditorState): boolean {
    return true
  }

  getDefaultKeyCombo(): keybind | null {
    return null
  }

  /** Returns whether a mark is being stored or is used in the selection. */
  protected isMarkActive(state: EditorState, markType: MarkType): boolean {
    let {$from, from, to, empty} = state.selection as NodeSelection
    // If there is no selection, check whether the mark is toggled on
    if (empty) {
      return markType.isInSet(state.storedMarks || $from.marks()) !== undefined
    } else {
      // Check if the mark is used anywhere in the selection
      return state.doc.rangeHasMark(from === to ? from : from, to, markType) 
    }
  }

  /** Returns the first node in the current selection with the set attributes. */
  protected selectionHasNode(state: EditorState, nodeType: NodeType, attrs?: Attrs): Node | null {
    return ProseMirrorUtils.selectionHasNode(state, nodeType, attrs)
  }

  /** Returns the block range at the current selection. */
  protected getNodeRange(state: EditorState): NodeRange {
    return ProseMirrorUtils.getNodeRange(state)
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
