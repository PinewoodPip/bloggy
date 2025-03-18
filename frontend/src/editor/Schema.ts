/**
 * The ProseMirror document schema used by the editor.
 */
import { Schema, type MarkSpec } from 'prosemirror-model'
import { schema as BasicSchema } from 'prosemirror-schema-basic'
import { addListNodes } from "prosemirror-schema-list"

const nodes = addListNodes(BasicSchema.spec.nodes, 'paragraph block*', 'block')

const marks: {[markType: string]: MarkSpec} = {
  strong: BasicSchema.spec.marks.get('strong') as MarkSpec,
  em: BasicSchema.spec.marks.get('em') as MarkSpec, // Italics
  code: BasicSchema.spec.marks.get('code') as MarkSpec, // Inline code
  underline: {
    inclusive: true,
    spanning: true,
  } as MarkSpec
}
export const schema = new Schema(
  {
    nodes: nodes,
    marks: marks,
  }
)