/**
 * Implements clipboard-related actions; copy, paste, etc.
 */
import { Node } from 'prosemirror-model'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { ToolbarGroup, ToolbarGroupAction } from '../Editor'
import { schema } from '../Schema'
import { Action } from './Action'

export class Copy extends Action {
  static override ID: string = 'ClipboardCopy'

  constructor() {
    super({
      id: Copy.ID,
      name: 'Copy',
      icon: 'i-material-symbols-content-copy',
    })
  }

  async execute(state: EditorState): Promise<Transaction | null> {
    const type = 'web application/json'
    const selection = state.selection.content().toJSON()
    const item = new ClipboardItem({[type]: JSON.stringify(selection)})
    // There's no real need to await this
    navigator.clipboard.write([
      item
    ])
    return null
  }
}

export class Paste extends Action {
  static override ID: string = 'ClipboardPaste'

  constructor() {
    super({
      id: Paste.ID,
      name: 'Paste',
      icon: 'i-material-symbols-content-paste-go',
    })
  }

  async execute(state: EditorState): Promise<Transaction | null> {
    try {
      // Read clipboard
      const items = await navigator.clipboard.read()
      for (const clipboardItem of items) {
        for (const type of clipboardItem.types) {
          // Search for JSON items
          if (type === 'web application/json') {
            const itemBlob = await clipboardItem.getType(type)
            const itemText = await itemBlob.text()
            const json = JSON.parse(itemText)
  
            // Parse nodes
            const nodes = []
            for (let content of json.content) {
              const node = Node.fromJSON(schema, content)
              nodes.push(node)
            }
  
            // Create transaction
            let tr = state.tr
            for (const node of nodes) {
              tr = tr.insert(state.selection.anchor, node) // TODO insert within current node if possible
            }
            return tr
          }
        }
      }
    } catch (e) {
      console.warn('Could not paste content', e)
    }
    return null
  }
}

export const actionGroup: ToolbarGroup = {
  name: 'Clipboard',
  items: [
    {type: 'action', actionID: Copy.ID} as ToolbarGroupAction,
    {type: 'action', actionID: Paste.ID} as ToolbarGroupAction,
  ]
}