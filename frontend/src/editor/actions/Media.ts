/**
 * Implements actions for inserting media nodes, such as images.
 */
import { type EditorState, type Transaction } from 'prosemirror-state'
import type { actionID, EmbedAttrs } from '../Editor'
import type { ToolGroup, ActionTool, MenuTool, CallbackTool, Tool } from '../ToolManager'
import { ProseMirrorUtils } from '~/utils/ProseMirror'
import { Action } from './Action'
import { schema } from '../Schema'

export class InsertImage extends Action {
  static ID: string = 'InsertImage'

  constructor() {
    super('InsertImage')
  }

  execute(state: EditorState, params: {href: string, alt?: string}): Transaction | Promise<Transaction> | null {
    const imageNode = schema.nodes['image']
    const image = imageNode.create(params)
    let tr = state.tr
    tr.replaceSelectionWith(image)
    return tr
  }
}

/** Action to insert external content embeds. */
export class InsertEmbed extends Action {
  static ID: string = 'InsertEmbed'

  constructor() {
    super(InsertEmbed.ID)
  }

  execute(state: EditorState, params: EmbedAttrs): Transaction | Promise<Transaction> | null {
    const embedNode = schema.nodes['embed']
    const embed = embedNode.create(params)
    let tr = state.tr
    tr.replaceSelectionWith(embed)
    return tr
  }
}