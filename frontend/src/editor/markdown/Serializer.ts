/**
 * Serializer for editor documents, based on the Markdown spec.
 * Elements of CommonMark will be serialized by their spec,
 * wrapped by Markdown-like emphasis marks (for ProseMirror marks).
 */
import { defaultMarkdownSerializer } from 'prosemirror-markdown'

const _DocumentSerializer = defaultMarkdownSerializer

// Register extra mark types
_DocumentSerializer.marks['underline'] = {open: "__", close: "__", mixable: true, expelEnclosingWhitespace: true}

export const DocumentSerializer = _DocumentSerializer;