/**
 * Parser for editor documents; converts the Markdown-like spec
 * into a ProseMirror document node.
 */
import { MarkdownParser } from 'prosemirror-markdown'
import MarkdownIt from 'markdown-it'
import { schema } from '~/src/editor/Schema'
import { plugin as UnderlinePlugin } from './plugins/underline'
import { alert as AlertPlugin } from "@mdit/plugin-alert";
import { footnote as FootnotePlugin } from "@mdit/plugin-footnote";
import { attrs as AttributesPlugin } from "@mdit/plugin-attrs";
import { container as ContainerPlugin } from "@mdit/plugin-container";
import type Token from 'markdown-it/lib/token.mjs'

// Extend CommonMark parser
const md = MarkdownIt('commonmark', {html: false})
md.use(UnderlinePlugin)
md.use(AlertPlugin)
md.use(FootnotePlugin)
md.use(AttributesPlugin)
// For embed node
md.use(ContainerPlugin, {
  name: 'embed',
})
export const Markdown = md

/** From prosemirror-markdown */
function listIsTight(tokens: readonly Token[], i: number) {
  while (++i < tokens.length)
    if (tokens[i].type != "list_item_open") return tokens[i].hidden
  return false
}

/** Extracts attributes added by the mkit-attrs plugin. */
function extractBlockAttributes(tok: Token, tokens: Token[], i: integer): object {
  const attrs = tok.attrs
  const nodeAttrs: {[key: string]: string} = {}
  if (attrs) {
    // Token attribute key and values are stored as pairs
    for (const pair of attrs) {
      nodeAttrs[pair[0]] = pair[1]
    }
  }
  return nodeAttrs
}

const _DocumentParser = new MarkdownParser(schema, md, {
  // Nodes
  blockquote: {block: "blockquote"},
  alert: {block: "alert", getAttrs: tok => {
    return ({type: tok.markup})
  }},
  alert_title: {block: "blockquote", noCloseToken: true},
  paragraph: {block: "paragraph", getAttrs: extractBlockAttributes},

  // Footnotes are split into multiple parts by the plugin; we only care about the ref as we store all required info there
  footnote_ref: {node: "footnote", noCloseToken: true, getAttrs: (tok, tokens, i) => {
    const label:string = tok.meta.label
    const parts = label.split('--')
    return {index: parseInt(parts[0]), text: parts[1].replace(/_/g, ' ')} // Spaces are encoded differently
  }},
  footnote_block: {ignore: true,},
  footnote_reference: {ignore: true,},
  footnote_anchor: {ignore: true, noCloseToken: true,},
  footnote: {ignore: true,},

  list_item: {block: "list_item"},
  bullet_list: {block: "bullet_list", getAttrs: (_, tokens, i) => ({tight: listIsTight(tokens, i)})},
  ordered_list: {block: "ordered_list", getAttrs: (tok, tokens, i) => ({
    order: +tok.attrGet("start")! || 1,
    tight: listIsTight(tokens, i)
  })},
  heading: {block: "heading", getAttrs: tok => ({level: +tok.tag.slice(1)})},
  code_block: {block: "code_block", noCloseToken: true},
  fence: {block: "code_block", getAttrs: tok => ({language: tok.info || "javascript"}), noCloseToken: true},
  hr: {node: "horizontal_rule"},
  image: {node: "image", getAttrs: tok => ({
    src: tok.attrGet("src"),
    title: tok.attrGet("title") || null,
    alt: tok.children![0] && tok.children![0].content || null
  })},
  hardbreak: {node: "hard_break"},
  container_embed: {block: "embed", getAttrs: extractBlockAttributes},

  // Marks
  em: {mark: "em"},
  strong: {mark: "strong"},
  underline: {mark: "underline"},
  link: {mark: "link", getAttrs: tok => ({
    href: tok.attrGet("href"),
    title: tok.attrGet("title") || null
  })},
  code_inline: {mark: "code", noCloseToken: true},
})

export const DocumentParser = _DocumentParser