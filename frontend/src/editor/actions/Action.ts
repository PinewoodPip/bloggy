/**
 * Base class for editor actions.
 */
import type { Attrs, MarkType, NodeType, Node } from 'prosemirror-model'
import type { Command, EditorState, NodeSelection, Transaction } from 'prosemirror-state'
import type { ActionDef, IAction, actionID, keybind } from '../Editor'

export abstract class Action implements IAction {
  static ID: actionID
  def: ActionDef

  constructor(def: ActionDef) {
    this.def = def
  }

  abstract execute(state: EditorState): Transaction | Promise<Transaction> | null

  isActive(state: EditorState): boolean {
    return false
  }

  getDefaultKeyCombo(): keybind | null {
    return null
  }

  /** Returns whether a mark is being stored or is used in the selection. */
  protected isMarkActive(state: EditorState, markType: MarkType): boolean {
    let {$from, from, to, empty} = state.selection as NodeSelection
    // If there is no selection, check whether the mark is toggled on
    if (empty) {
      return !!markType.isInSet(state.storedMarks || $from.marks())
    } else {
      // Check if the mark is used anywhere in the selection
      return state.doc.rangeHasMark(from === to ? from : from, to, markType) 
    }
  }

  /** Returns the first node in the current selection with the set attributes. */
  protected selectionHasNode(state: EditorState, nodeType: NodeType, attrs?: Attrs): Node | null {
    let foundNode: Node | null = null
    for (let i = 0; i < state.selection.ranges.length && !foundNode; i++) {
      let {$from: {pos: from}, $to: {pos: to}} = state.selection.ranges[i]
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (foundNode) return
        if (attrs) {
          if (node.hasMarkup(nodeType, attrs)) {
            foundNode = node
          }
        } else {
          if (node.type == nodeType) {
            foundNode = node
          }
        }
      })
    }
    return foundNode
  }

  /** Returns a list of nodes of a type that match the passed attributes, if any. */
  protected findNodes(state: EditorState, nodeType: NodeType, attrs?: Attrs): {node: Node | null, startPos: integer, endPos: integer}[] {
    let startPos = 0
    let endPos = 0
    let matches:{node: Node | null, startPos: integer, endPos: integer}[] = []

    // Recursive function to traverse nodes
    const f = (docNode: Node, offset: integer, index: integer, depth: integer) => {
      // console.log(docNode.type, nodeType, depth)
      if (docNode.type == nodeType) {
        let valid = true
        if (attrs) {
          for (const key in attrs) {
            if (docNode.attrs[key] !== attrs[key]) {
              valid = false
              break
            }
          }
        }
        if (valid) {
          startPos = offset;
          endPos = offset + docNode.nodeSize;

          matches.push({
            node: docNode,
            startPos: startPos + depth,
            endPos: endPos + depth,
          })
        }
      }

      // Traverse children
      docNode.forEach((child, childOffset, childIndex) => {
        f(child, offset + childOffset, childIndex, depth + 1)
      })
    }

    // Traverse top-level nodes
    state.doc.forEach((docNode, offset, index) => {
      f(docNode, offset, index, 0)
    });

    return matches
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
