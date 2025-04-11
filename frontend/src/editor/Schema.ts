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

// Add align attribute to paragraph
const paragraph = nodes.get('paragraph')
paragraph!.attrs = {
  'align': {
    default: 'left',
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

// Add footnote inline node
nodes = nodes.addToEnd('footnote', {
  inline: true,
  attrs: {
    index: {default: 1},
    text: {default: 'test'}
  },
  defining: true,
  draggable: true,
  atom: true,
  group: "inline",
  parseDOM: [{tag: "sup[text][index]", getAttrs(dom) {
    return {
      test: (dom as HTMLElement).getAttribute("text"),
      index: (dom as HTMLElement).getAttribute("index"),
    }
  }}],
  toDOM(node) {
    const sup = document.createElement('sup')
    sup.innerHTML = `[${node.attrs.index}]`
    sup.setAttribute('index', node.attrs.index)
    sup.setAttribute('text', node.attrs.text)
    return {
      dom: sup,
      domElement: sup,
    }
  }
})

// Add embed node
nodes = nodes.addToEnd('embed', {
  inline: false,
  group: "block",
  content: '',
  attrs: {
    type: {default: ''},
    contentID: {default: ''},
  },
  defining: false,
  draggable: true,
  atom: true,

  // Note: since the editor never (de)serializes to/from HTML, these are basically unused
  parseDOM: [{tag: "div[embed-type]", getAttrs(dom) {
    return {
      type: (dom as HTMLElement).getAttribute("embed-type"),
      contentID: (dom as HTMLElement).innerHTML,
    }
  }}],
  toDOM(node) {
    const div = document.createElement('div')
    div.innerHTML = node.attrs.contentID
    div.setAttribute('embed-type', node.attrs.type)
    return {
      dom: div,
      domElement: div,
    }
  }
})

const marks: {[markType: string]: MarkSpec} = {
  strong: BasicSchema.spec.marks.get('strong') as MarkSpec,
  link: BasicSchema.spec.marks.get('link') as MarkSpec,
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