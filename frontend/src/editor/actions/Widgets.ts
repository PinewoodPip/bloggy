/**
 * Implements actions for inserting semantic block nodes, such as code blocks.
 */
import { setBlockType } from 'prosemirror-commands'
import { MarkType, Node, NodeRange, NodeType } from "prosemirror-model"
import { toggleMark } from 'prosemirror-commands'
import { TextSelection, type EditorState, type Transaction } from 'prosemirror-state'
import { ProseMirrorUtils } from '~/utils/ProseMirror'
import type { actionID, alertType, AnnotationAttrs, } from '../Editor'
import type { ToolGroup, ActionTool, MenuTool, Tool } from '../ToolManager'
import { Action } from './Action'
import { schema } from '../schemas/Article'
import { Comment } from '~/composables/editor/plugins/Annotations'

export class InsertCodeBlock extends Action {
  static ID: string = 'InsertCodeBlock'

  constructor() {
    super('InsertCodeBlock')
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    const codeBlockNode = schema.nodes['code_block']
    const paragraphNode = schema.nodes['paragraph']
    const command = this.selectionHasNode(state, codeBlockNode) ? setBlockType(paragraphNode) : setBlockType(codeBlockNode, {language: ''})
    return this.getTransaction(command, state)
  }
}

/** Wraps/unwraps a selection into a node with set attributes. */
export class ToggleNodeWithAttrs extends Action {
  nodeType: NodeType
  attrs?: object

  constructor(id: string, nodeType: NodeType, attrs?: object) {
    super(id)
    this.nodeType = nodeType
    this.attrs = attrs
  }

  execute(state: EditorState, attrs?: object): Transaction | Promise<Transaction> | null {
    const nodeType = this.nodeType
    attrs = (attrs || this.attrs)! // Fallback to default attrs

    // If the selection is already an alert of the same type, pop its child out (removing the alert in the process, as it cannot be a leaf)
    if (this.selectionHasNode(state, nodeType, attrs)) {
      let tr = state.tr

      // Find top-most node(s) below the alert
      let found = false
      let depth = -1
      let parentStart = null
      let parentEnd = null
      const cursor = tr.selection
      while (!found) {
        const parent = cursor.$from.node(depth)
        if (parent.type === nodeType) {
          parentStart = cursor.$from.start(depth)
          parentEnd = cursor.$from.end(depth)
          break
        }
        depth--;
      }
      if (parentStart && parentEnd) {
        const nodeStart = tr.doc.resolve(parentStart).blockRange(tr.doc.resolve(parentEnd))!
        tr = tr.lift(nodeStart, 0)
      }
      return tr
    } else if (this.selectionHasNode(state, nodeType)) { // If the selection has the node already, update its attrs
      let tr = state.tr
      const cursor = tr.selection
      const nodeStart = cursor.$from.before(-1)
      for (const [k, v] of Object.entries(attrs)) {
        tr.setNodeAttribute(nodeStart, k, v)
      }
      return tr
    } else { // Otherwise create a node and insert the selection as its child
      let tr = state.tr
      const cursor = tr.selection
      const nodeStart = cursor.$from.blockRange(cursor.$to)!
      tr.wrap(nodeStart, [{type: nodeType, attrs: attrs}])
      return tr
    }
  }
}

/** Adds an annotation to a text/node selection. Requires the annotations plugin. */
export class SetAnnotation extends Action {
  constructor() {
    super('SetAnnotation')
  }

  override execute(state: EditorState, attrs: AnnotationAttrs): Transaction | Promise<Transaction> | null {
    const sel = state.selection
    const commentPlugin = ProseMirrorUtils.getPlugin(state, 'comment$')
    return state.tr.setMeta(commentPlugin, {type: "newComment", from: sel.from, to: sel.to, comment: new Comment(attrs.comment, MathUtils.randomID(), attrs.author)})
  }

  override isApplicable(state: EditorState): boolean {
    return !state.selection.empty // Selection cannot be empty
  }
}

/** Deletes annotations by ID. */
export class DeleteAnnotation extends Action {
  constructor() {
    super('SetAnnotation')
  }

  override execute(state: EditorState, attrs: {id: integer}): Transaction | Promise<Transaction> | null {
    const commentPlugin = ProseMirrorUtils.getPlugin(state, 'comment$')
    return state.tr.setMeta(commentPlugin, {type: "deleteComment", comment: {id: attrs.id}}) // This event only requires the ID field
  }
}

export class InsertFootnote extends Action {
  static ID: string = 'InsertFootnote'

  constructor() {
    super('InsertFootnote')
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    const footnoteNode = schema.nodes['footnote']

    // Use next available index
    const footnotes = ProseMirrorUtils.findNodes(state, footnoteNode)

    const newIndex = footnotes.length + 1
    let tr = state.tr
    tr.replaceSelectionWith(footnoteNode.createAndFill({text: 'A footnote', index: newIndex})!)

    return tr
  }

  updateFootnote(state: EditorState, index: integer, text:string): Transaction | null {
    const footnoteNode = schema.nodes['footnote']
    const footnotes = ProseMirrorUtils.findNodes(state, footnoteNode, {index: index})
    let tr: Transaction | null = null
    if (footnotes.length > 0) {
      const footnote = footnotes[0]
      tr = state.tr
      tr = tr.setNodeAttribute(footnote.startPos, 'text', text)
    }
    return tr
  }
}