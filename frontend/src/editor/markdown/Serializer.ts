/**
 * Serializer for editor documents, based on the Markdown spec.
 * Elements of CommonMark will be serialized by their spec,
 * wrapped by Markdown-like emphasis marks (for ProseMirror marks).
 */
import { defaultMarkdownSerializer } from 'prosemirror-markdown'

const _DocumentSerializer = defaultMarkdownSerializer

// Register extra mark types
_DocumentSerializer.marks['underline'] = {open: "__", close: "__", mixable: true, expelEnclosingWhitespace: true}

// Adjust code block serializing to use language attribute instead of "params"
// Adapted from prosemirror-markdown.
_DocumentSerializer.nodes['code_block'] = (state, node) => {
  // Make sure the front matter fences are longer than any dash sequence within it
  const backticks = node.textContent.match(/`{3,}/gm)
  const fence = backticks ? (backticks.sort().slice(-1)[0] + "`") : "```"

  state.write(fence + (node.attrs.language || "") + "\n")
  state.text(node.textContent, false)
  // Add a newline to the current content before adding closing marker
  state.write("\n")
  state.write(fence)
  state.closeBlock(node)
}

// Serialize alert nodes
_DocumentSerializer.nodes['alert'] = (state, node) => {
  state.write(`> [!${node.attrs.type}]` + "\n") // Write header
  // Write child nodes
  for (const child of node.children) {
    state.text("> ")
    state.renderInline(child)
    state.text("\n")
  }
  // Add a newline to the current content before adding closing marker
  state.write("\n")
  state.closeBlock(node)
}

// Serialize footnote nodes
_DocumentSerializer.nodes['footnote'] = (state, node) => {
  let text:string = node.attrs.text
  text = text.replace(/ /g, '_')
  state.text(`[^${node.attrs.index}--${text}]`, false) // Must not closeBlock as this is an inline block
}

// Add align attribute to paragraph
_DocumentSerializer.nodes['paragraph'] = (state, node) => {
  state.renderInline(node)
  state.text(` {align=${node.attrs.align}}\n\n`)
}

// Serialize embed nodes
_DocumentSerializer.nodes['embed'] = (state, node) => {
  // Uses mkit-plugin's container + attributes plugins
  state.text(`::: embed {type=${node.attrs.type} contentID=${node.attrs.contentID}}\n`)
  state.text(`:::\n\n`)
}

export const DocumentSerializer = _DocumentSerializer;