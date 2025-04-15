/**
 * Implements actions for inserting section-delimiting document elements,
 * such as headings.
 */
import { setBlockType, wrapIn } from 'prosemirror-commands'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { actionID, keybind } from '../Editor'
import type { Group, GroupAction, GroupActionMenu, GroupItem } from '../Toolbar'
import { Action } from './Action'
import { schema } from '../Schema'

export class SetHeading extends Action {
  private level: integer

  constructor(level: integer) {
    super(`SetHeading.ID.${level}`)

    this.level = level
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    const headingNodeType = schema.nodes['heading']

    // Check if any node within the selection already is a heading
    let hasSameHeading = false
    const attrs = {level: this.level}
    for (let i = 0; i < state.selection.ranges.length && !hasSameHeading; i++) {
      let {$from: {pos: from}, $to: {pos: to}} = state.selection.ranges[i]
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (hasSameHeading) return
        if (node.hasMarkup(headingNodeType, attrs)) {
          hasSameHeading = true
        }
      })
    }

    // Change to paragraph if the nodes already had this heading,
    // otherwise change it to the heading type
    const command = hasSameHeading ? setBlockType(schema.nodes['paragraph']) : setBlockType(headingNodeType, {level: this.level})

    return this.getTransaction(command, state)
  }
  
  override getDefaultKeyCombo(): keybind | null {
    return null
  }
}

export class InsertHorizontalRule extends Action {
  static ID: string = 'InsertHorizontalRule'

  constructor() {
    super(InsertHorizontalRule.ID)
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    const hr = schema.nodes['horizontal_rule']
    const transaction = state.tr.replaceSelectionWith(hr.create()) // Will simply insert the node if the selection is empty
    return transaction
  }
  
  override getDefaultKeyCombo(): keybind | null {
    return null
  }
}

export class MakeQuote extends Action {
  static ID: string = 'MakeQuote'

  constructor() {
    super(MakeQuote.ID)
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    const quote = schema.nodes['blockquote']
    const command = wrapIn(quote) // Transform selected nodes into children of a new quote node
    return this.getTransaction(command, state)
  }
  
  override getDefaultKeyCombo(): keybind | null {
    return null
  }
}

/**
 * Action group
 */
// Creating heading actions
const _headingActions: Action[] = []
const _headingActionItems: GroupItem[] = []
for (let i = 1; i <= 6; ++i) {
  const action = new SetHeading(i)
  _headingActions.push(action)
  _headingActionItems.push({
    type: 'action',
    id: action.id,
    def: {
      name: `Set Heading ${i}`,
      icon: 'i-material-symbols-h-mobiledata-badge-outline', // TODO better icon
    },
  })
}
let _actionGroup: Group = {
  name: 'Sectioning',
  items: [
    {
      type: 'actionMenu',
      id: 'sectioning.heading.menu',
      def: {
        icon: 'i-material-symbols-h-mobiledata-badge-outline',
        name: 'Set Heading',
      },
      subitems: _headingActionItems,
    } as GroupActionMenu,
    {
      type: 'action',
      id: InsertHorizontalRule.ID,
      def: {
        name: 'Insert Horizontal Rule',
        icon: 'i-material-symbols-horizontal-rule',
      },
    } as GroupAction,
    {
      type: 'action',
      id: MakeQuote.ID,
      def: {        
        name: 'Insert Quote',
        icon: 'i-material-symbols-format-quote',
      },
    } as GroupAction,
  ],
}
export const headingActions = _headingActions
export const actionGroup = _actionGroup
