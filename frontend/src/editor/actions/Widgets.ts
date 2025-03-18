/**
 * Implements actions for inserting semantic block nodes, such as code blocks.
 */
import { lift, setBlockType } from 'prosemirror-commands'
import { wrapInList } from 'prosemirror-schema-list'
import { NodeType } from "prosemirror-model"
import type { Command, EditorState, Transaction } from 'prosemirror-state'
import type { ToolbarGroup, ToolbarGroupAction } from '../Editor'
import { Action } from './Action'
import { schema } from '../Schema'

export class InsertCodeBlock extends Action {
  static override ID: string = 'InsertCodeBlock'

  constructor() {
    super({
      id: 'InsertCodeBlock',
      name: 'Toggle Code Block',
      icon: 'material-symbols:code-blocks-outline',
    })
  }

  async execute(state: EditorState): Promise<Transaction | null> {
    const codeBlockNode = schema.nodes['code_block']
    const paragraphNode = schema.nodes['paragraph']
    const command = this.selectionHasNode(state, codeBlockNode) ? setBlockType(paragraphNode) : setBlockType(codeBlockNode, {language: 'javascript'})
    return this.getTransaction(command, state)
  }
}

/**
 * Action group
 */
let _actionGroup: ToolbarGroup = {
  name: 'Widgets',
  items: [
    {
      type: 'action',
      actionID: InsertCodeBlock.ID,
    } as ToolbarGroupAction,
  ],
}
export const actionGroup = _actionGroup
