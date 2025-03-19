/**
 * The ProseMirror document schema used by the editor.
 */
import { Schema, type MarkSpec } from 'prosemirror-model'
import { schema as BasicSchema } from 'prosemirror-schema-basic'
import { addListNodes } from "prosemirror-schema-list"

let nodes = addListNodes(BasicSchema.spec.nodes, 'paragraph block*', 'block')

// Change code block attribute names
const codeBlock = nodes.get('code_block')
codeBlock!.attrs = {
  'language': {
    default: 'javascript',
  }
}

// Add alert/admonition block 
nodes = nodes.addBefore('blockquote', 'alert', {
  content: "paragraph+",
  group: "block",
  defining: true,
  attrs: {
    type: {default: "note"},
  },
  parseDOM: [{tag: "article", getAttrs: node => (
    {type: (node as HTMLElement).getAttribute("data-alert-type") || ""}
  )}],
  toDOM(node) { return [
    "article",
    node.attrs.type ? {"data-alert-type": node.attrs.type, "class": `markdown-alert markdown-alert-${node.attrs.type}`} : {},
    0
  ]}
})

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