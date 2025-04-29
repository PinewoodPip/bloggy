/**
 * Schema for a comment editor.
 * Has only minimal markup support.
 */
import { Schema, type MarkSpec } from 'prosemirror-model'
import { schema as BasicSchema } from 'prosemirror-schema-basic'
import { addListNodes } from "prosemirror-schema-list"
import * as Definitions from '~/src/editor/schemas/Nodes'

let nodes = addListNodes(BasicSchema.spec.nodes, 'paragraph block*', 'block')

// Add nodes
nodes = nodes.update('paragraph', Definitions.Paragraph)
nodes = nodes.addBefore('blockquote', 'alert', Definitions.Alert)

// Remove some Markdown media nodes
nodes = nodes.remove('image')

// Set marks
const marks: {[markType: string]: MarkSpec} = {
  strong: BasicSchema.spec.marks.get('strong') as MarkSpec,
  link: BasicSchema.spec.marks.get('link') as MarkSpec,
  em: BasicSchema.spec.marks.get('em') as MarkSpec, // Italics
  code: BasicSchema.spec.marks.get('code') as MarkSpec, // Inline code
  underline: Definitions.Underline,
}

export const schema = new Schema(
  {
    nodes: nodes,
    marks: marks,
  }
)