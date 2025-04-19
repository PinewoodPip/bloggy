/**
 * Implements clipboard-related actions; copy, paste, etc.
 */
import { Node } from 'prosemirror-model'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { Group, GroupAction, GroupCallback } from '../Toolbar'
import { schema } from '../Schema'
import { Action } from './Action'

export const actionGroup: Group = {
  name: 'Clipboard',
  items: [
    {
      type: 'callback',
      id: 'ClipboardCopy',
      def: {
        name: 'Copy',
        icon: 'i-material-symbols-content-copy',
      },
    } as GroupCallback,
    {
      type: 'callback',
      id: 'ClipboardCut',
      def: {
        name: 'Cut',
        icon: 'material-symbols:content-cut',
      },
    } as GroupCallback,
    {
      type: 'callback',
      id: 'ClipboardPaste',
      def: {
        name: 'Paste',
        icon: 'i-material-symbols-content-paste-go',
      },
    } as GroupCallback,
  ]
}