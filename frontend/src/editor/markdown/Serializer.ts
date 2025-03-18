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

export const DocumentSerializer = _DocumentSerializer;