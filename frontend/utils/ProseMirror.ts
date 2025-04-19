/**
 * ProseMirror utilities for commands and document traversal.
 */
import type { Attrs, NodeType, Node, NodeRange, ResolvedPos, MarkType } from 'prosemirror-model'
import { TextSelection, Transaction, NodeSelection, type EditorState } from 'prosemirror-state'

export const ProseMirrorUtils = {
  /** Returns a selection over the blocks contained in the cursor selection. */
  getNodeRange(state: EditorState): NodeRange {
    const cursor = state.selection
    let node = cursor.$from.blockRange()
    return node!
  },

  /** Inserts a node at the cursor's position. */
  insertAtCursor(tr: Transaction, node: Node): Transaction {
    tr = tr.insert(tr.selection.from, node)
    return tr
  },

  /** Counts the words of a node's text, including descendants. */
  countWords(node: Node): integer {
    const text = node.textContent
    return StringUtils.countWords(text)
  },

  /** Sets the selection to that of the node at the position. */
  selectNode(tr: Transaction, pos: integer): Transaction {
    let sel = NodeSelection.create(tr.doc, pos)
    tr = tr.setSelection(sel)
    return tr
  },

  /** Inserts a node before the cursor's position. */
  insertBeforeCursor(tr: Transaction, node: Node): Transaction {
    tr = tr.insert(tr.selection.from - 1, node)
    return tr
  },

  /** Returns whether a position has a mark. */
  hasMark(pos: ResolvedPos, markType: MarkType): boolean {
    return pos.marks().find((mark) => mark.type == markType) !== undefined
  },

  /** Returns a text selection that spans the word at the cursor's position. */
  selectWord(state: EditorState): TextSelection {
    const range = this.getNodeRange(state)
    const node = range.$from.node()
    const cursor = state.selection
    const from = cursor.from
    let index = range.$from.parentOffset

    // Find word start
    let charsBefore = 0
    while (true) {
      let nextChar = node.textBetween(index - 1, index)
      if (!nextChar || nextChar.match(/\W/)) {
        break
      }
      charsBefore++;
      index--;
    }

    // Find word end
    let wordChars = 0
    while (true) {
      let nextChar = node.textBetween(index, index + 1)
      if (!nextChar || nextChar.match(/\W/)) {
        break
      }
      wordChars++;
      index++;
    }

    return TextSelection.create(state.doc, from - charsBefore, from - charsBefore + wordChars)
  },

  /** Returns a list of nodes of a type that match the passed attributes, if any. */
  findNodes(state: EditorState, nodeType: NodeType, attrs?: Attrs): {node: Node, startPos: integer, endPos: integer}[] {
    let startPos = 0
    let endPos = 0
    let matches:{node: Node, startPos: integer, endPos: integer}[] = []

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
  },
}