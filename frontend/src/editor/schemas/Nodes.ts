/**
 * Common node and mark type definitions.
 */
import { Schema, type MarkSpec, type NodeSpec } from 'prosemirror-model'
import { schema as BasicSchema } from 'prosemirror-schema-basic'
import { addListNodes } from "prosemirror-schema-list"

// Use the basic markdown schema as base
const nodes = BasicSchema.spec.nodes

// Change code block attribute names
const codeBlock = nodes.get('code_block')
codeBlock!.attrs = {
  'language': {
    default: 'javascript',
  }
}
export const CodeBlock = codeBlock

// Add align attribute to paragraph
const paragraph = nodes.get('paragraph')
paragraph!.attrs = {
  'align': {
    default: 'left',
  }
}
export const Paragraph = paragraph!

// Add alert/admonition block 
const alert = {
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
} as NodeSpec
export const Alert = alert

// Add footnote inline node
const footnote = {
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
} as NodeSpec
export const Footnote = footnote

// Add embed node
const embed = {
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
} as NodeSpec
export const Embed = embed

// Add underline
export const Underline = {
  inclusive: true,
  spanning: true,
} as MarkSpec

