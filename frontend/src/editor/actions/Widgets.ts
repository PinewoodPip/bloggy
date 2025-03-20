/**
 * Implements actions for inserting semantic block nodes, such as code blocks.
 */
import { setBlockType } from 'prosemirror-commands'
import { Node } from "prosemirror-model"
import { TextSelection, type EditorState, type Transaction } from 'prosemirror-state'
import type { actionID, alertType, ToolbarGroup, ToolbarGroupAction, ToolbarGroupActionMenu } from '../Editor'
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

export class InsertAlert extends Action {
  static override ID: string = 'InsertAlert'

  protected alertType: alertType

  constructor(type: alertType) {
    super({
      id: `InsertAlert.${type}`,
      name: `Toggle ${type} note`,
      icon: 'material-symbols:lightbulb-2-outline', // TODO different icon per type
    })
    this.alertType = type
  }

  async execute(state: EditorState): Promise<Transaction | null> {
    const alertNode = schema.nodes['alert']

    if (this.selectionHasNode(state, alertNode, {type: this.alertType})) { // If the selection is already an alert of the same type, pop its child out (removing the alert in the process, as it cannot be a leaf)
      let tr = state.tr
      const cursor = tr.selection
      const nodeStart = cursor.$from.blockRange()!
      tr = tr.lift(nodeStart, nodeStart!.depth - 1)
      return tr
    } else if (this.selectionHasNode(state, alertNode)) { // If the selection has some other type of alert, change its type
      let tr = state.tr
      const cursor = tr.selection
      const nodeStart = cursor.$from.before(-1)
      tr.setNodeAttribute(nodeStart, 'type', this.alertType)
      return tr
    } else { // Otherwise create an alert and insert the selection as its child
      let tr = state.tr
      const cursor = tr.selection
      const nodeStart = cursor.$from.blockRange()!
      tr.replaceWith(nodeStart.start, nodeStart.end, alertNode.create({type: this.alertType}, nodeStart.$from.node()))
      tr.setSelection(TextSelection.create(tr.doc, cursor.from + 1)) // Move cursor into the new node
      return tr
    }
  }
}

/**
 * Action group
 */
// Create alert actions
let _alertActions: Action[] = [
  new InsertAlert('note'),
  new InsertAlert('tip'),
  new InsertAlert('important'),
  new InsertAlert('caution'),
  new InsertAlert('warning'),
]
const alertActionIDs: actionID[] = []
for (const action of _alertActions) {
  alertActionIDs.push(action.def.id)
}
let _actionGroup: ToolbarGroup = {
  name: 'Widgets',
  items: [
    {
      type: 'action',
      actionID: InsertCodeBlock.ID,
    } as ToolbarGroupAction,
    {
      type: 'actionMenu',
      icon: 'material-symbols:lightbulb-2-outline',
      name: 'Toggle Note',
      actionIDs: alertActionIDs,
    } as ToolbarGroupActionMenu,
  ],
}
export const actionGroup = _actionGroup
export const alertActions = _alertActions
