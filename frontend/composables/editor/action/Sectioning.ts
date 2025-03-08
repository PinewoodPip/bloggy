/**
 * Implements actions for inserting section-delimiting document elements,
 * such as headings.
 */
import { setBlockType } from 'prosemirror-commands'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { keybind } from '../Editor'
import { Action } from './Action'
import { schema } from '../Schema'

export class SetHeading extends Action {
  static override ID: string = 'SetHeading'

  private level: integer

  constructor(level: integer) {
    super({
      id: `SetHeading.ID.${level}`,
      name: `Set Heading ${level}`,
      icon: 'i-material-symbols-h-mobiledata-badge-outline', // TODO better icon
    })

    this.level = level
  }

  execute(state: EditorState): Transaction | null {
    const nodeType = schema.nodes['heading']
    const command = setBlockType(nodeType, {level: this.level})
    return this.getTransaction(command, state)
  }
  
  override getDefaultKeyCombo(): keybind | null {
    return null
  }
}

export class InsertHorizontalRule extends Action {
  static override ID: string = 'InsertHorizontalRule'

  constructor() {
    super({
      id: InsertHorizontalRule.ID,
      name: 'Insert Horizontal Rule',
      icon: 'i-material-symbols-horizontal-rule',
    })
  }

  execute(state: EditorState): Transaction | null {
    const hr = schema.nodes['horizontal_rule']
    const transaction = state.tr.replaceSelectionWith(hr.create()) // Will simply insert the node if the selection is empty
    return transaction
  }
  
  override getDefaultKeyCombo(): keybind | null {
    return null
  }
}
