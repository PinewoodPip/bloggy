/**
 * Implements actions for inserting semantic block nodes, such as code blocks.
 */
import { setBlockType } from 'prosemirror-commands'
import { Node, NodeRange } from "prosemirror-model"
import { TextSelection, type EditorState, type Transaction } from 'prosemirror-state'
import { ProseMirrorUtils } from '~/utils/ProseMirror'
import type { actionID, alertType, } from '../Editor'
import type { Group, GroupAction, GroupActionMenu } from '../Toolbar'
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

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
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

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    const alertNode = schema.nodes['alert']

    if (this.selectionHasNode(state, alertNode, {type: this.alertType})) { // If the selection is already an alert of the same type, pop its child out (removing the alert in the process, as it cannot be a leaf)
      let tr = state.tr

      let found = false
      let depth = -1
      let parentStart = null
      let parentEnd = null
      const cursor = tr.selection
      while (!found) {
        const parent = cursor.$from.node(depth)
        if (parent.type === alertNode) {
          parentStart = cursor.$from.start(depth)
          parentEnd = cursor.$from.end(depth)
          break
        }
        depth--;
      }
      if (parentStart && parentEnd) {
        const nodeStart = tr.doc.resolve(parentStart).blockRange(tr.doc.resolve(parentEnd))!
        tr = tr.lift(nodeStart, 0)
      }
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
      const nodeStart = cursor.$from.blockRange(cursor.$to)!
      tr.wrap(nodeStart, [{type: alertNode}])
      return tr
    }
  }
}

export class InsertFootnote extends Action {
  static override ID: string = 'InsertFootnote'

  constructor() {
    super({
      id: 'InsertFootnote',
      name: 'Insert Footnote',
      icon: 'material-symbols:edit-note',
    })
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    const footnoteNode = schema.nodes['footnote']

    // Use next available index
    const footnotes = ProseMirrorUtils.findNodes(state, footnoteNode)

    const newIndex = footnotes.length + 1
    let tr = state.tr
    tr.replaceSelectionWith(footnoteNode.createAndFill({text: 'A footnote', index: newIndex})!)

    return tr
  }

  updateFootnote(state: EditorState, index: integer, text:string): Transaction | null {
    const footnoteNode = schema.nodes['footnote']
    const footnotes = ProseMirrorUtils.findNodes(state, footnoteNode, {index: index})
    let tr: Transaction | null = null
    if (footnotes.length > 0) {
      const footnote = footnotes[0]
      tr = state.tr
      tr = tr.setNodeAttribute(footnote.startPos, 'text', text)
    }
    return tr
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
let _actionGroup: Group = {
  name: 'Widgets',
  items: [
    {
      type: 'action',
      actionID: InsertCodeBlock.ID,
    } as GroupAction,
    {
      type: 'actionMenu',
      icon: 'material-symbols:lightbulb-2-outline',
      name: 'Toggle Note',
      actionIDs: alertActionIDs,
    } as GroupActionMenu,
    {
      type: 'action',
      actionID: InsertFootnote.ID,
    } as GroupAction,
  ],
}
export const actionGroup = _actionGroup
export const alertActions = _alertActions
