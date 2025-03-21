/**
 * ProseMirror utilities for commands and document traversal.
 */
import type { Attrs, NodeType, Node } from 'prosemirror-model'
import type { EditorState } from 'prosemirror-state'

export const ProseMirrorUtils = {
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
  }
}