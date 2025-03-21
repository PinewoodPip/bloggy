/**
 * Implements actions for inserting list elements.
 */
import { lift } from 'prosemirror-commands'
import { wrapInList } from 'prosemirror-schema-list'
import { NodeType, NodeRange, type Attrs } from "prosemirror-model"
import type { Command, EditorState, Transaction } from 'prosemirror-state'
import type { actionID, keybind, ToolbarGroup, ToolbarGroupActionMenu } from '../Editor'
import { Action } from './Action'
import { schema } from '../Schema'

/** Toggles a list-like node based on whether the selection is currently within a list node with only 1 item. */
function toggleList(nodeType: NodeType, state: EditorState): Command {
  // Check if list should be toggled off
  let isLoneListItem = false
  for (let i = 0; i < state.selection.ranges.length && !isLoneListItem; i++) {
    let range = state.selection.ranges[i]

    // Check if parent 2 levels up is a list with only this 1 child node
    const ancestor = range.$from.node(range.$from.depth - 2)
    if (ancestor.hasMarkup(nodeType) && ancestor.children.length == 1) {
      isLoneListItem = true
    }
  }

  if (isLoneListItem) {
    // If there is only 1 list item, "toggle" the list by lifting its only child out of it
    return lift
  } else {
    // Otherwise wrap the node in a list
    return wrapInList(nodeType)
  }
}

export class ToggleBulletList extends Action {
  static override ID: string = 'ToggleBulletList'

  constructor() {
    super({
      id: 'ToggleBulletList',
      name: 'Toggle Bullet List',
      icon: 'material-symbols:format-list-bulleted',
    })
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    return this.getTransaction(toggleList(schema.nodes['bullet_list'], state), state)
  }
  
  override getDefaultKeyCombo(): keybind | null {
    return 'ctrl_enter'
  }
}

export class ToggleNumberedList extends Action {
  static override ID: string = 'ToggleNumberedList'

  constructor() {
    super({
      id: ToggleNumberedList.ID,
      name: 'Toggle Numbered List',
      icon: 'material-symbols:format-list-numbered',
    })
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    return this.getTransaction(toggleList(schema.nodes['ordered_list'], state), state)
  }
  
  override getDefaultKeyCombo(): keybind | null {
    return null
  }
}

/**
 * Action group
 */
const headingActionIDs: actionID[] = [
  ToggleBulletList.ID,
  ToggleNumberedList.ID,
]
let _actionGroup: ToolbarGroup = {
  name: 'Lists',
  items: [
    {
      type: 'actionMenu',
      icon: 'material-symbols:format-list-bulleted',
      name: 'Toggle List',
      actionIDs: headingActionIDs,
    } as ToolbarGroupActionMenu,
  ],
}
export const actionGroup = _actionGroup
