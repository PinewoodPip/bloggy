/**
 * Implements clipboard-related actions; copy, paste, etc.
 */
import { Node } from 'prosemirror-model'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { Group, GroupAction } from '../Toolbar'
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

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
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

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    try {
      // Read clipboard
      // @ts-ignore
      return navigator.clipboard.read().then((items) => {
        for (const clipboardItem of items) {
          for (const type of clipboardItem.types) {
            // Search for JSON items
            if (type === 'web application/json') {
              return clipboardItem.getType(type).then((itemBlob) => {
                return itemBlob.text().then((itemText) => {
                  const json = JSON.parse(itemText)
      
                  // Parse nodes
                  const nodes = []
                  for (let content of json.content) {
                    const node = Node.fromJSON(schema, content)
                    nodes.push(node)
                  }
        
                  // Create transaction by inserting nodes
                  // Should be inserted in reverse order as we're not moving the cursor inbetween them (and nodes are inserted after it)
                  let tr = state.tr
                  for (let i = nodes.length - 1; i >= 0; --i) {
                    const node = nodes[i]
                    tr = tr.insert(state.selection.anchor, node) // TODO merge with current node if possible
                  }
                  return tr
                })
              })
            }
          }
        }
      })
    } catch (e) {
      console.warn('Could not paste content', e)
    }
    return null
  }
}

export const actionGroup: Group = {
  name: 'Clipboard',
  items: [
    {type: 'action', id: Copy.ID} as GroupAction,
    {type: 'action', id: Paste.ID} as GroupAction,
  ]
}