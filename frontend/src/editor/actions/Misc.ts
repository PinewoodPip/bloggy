/**
 * Miscellaneous editor actions.
 */
import { setBlockType, wrapIn } from 'prosemirror-commands'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { actionID, keybind } from '../Editor'
import type { Group, GroupAction, GroupActionMenu, GroupItem } from '../Toolbar'
import { Action } from './Action'
import { schema } from '../Schema'

/** Inserts text content at the cursor position. */
export class InsertText extends Action {
  constructor() {
    super('InsertText')
  }

  execute(state: EditorState, params: {text: string}): Transaction | Promise<Transaction> | null {
    return state.tr.insertText(params.text) // TODO replace with text node instead?
  }
}

/** Deletes the current selection. */
export class DeleteSelection extends Action {
  constructor() {
    super('DeleteSelection')
  }

  override execute(state: EditorState): Transaction | Promise<Transaction> | null {
    return state.tr.deleteSelection()
  }
}
