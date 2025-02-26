/**
 * Implements text formatting actions: bold, italics, etc.
 */
import type { EditorState, NodeSelection, Transaction } from 'prosemirror-state'
import { schema } from 'prosemirror-schema-basic'
import { toggleMark } from 'prosemirror-commands'
import type { ActionGroup, keyCombo } from '../Editor'
import { Action } from './Action'

export class FormatBold extends Action {
  static override ID = 'FormatBold'

  constructor() {
    super({
      name: 'Toggle Bold',
      icon: 'i-heroicons-bold',
    })
  }

  execute(state: EditorState): Transaction | null {
    const toggleBold = toggleMark(schema.marks.strong, null, {})
    return this.getTransaction(toggleBold, state)
  }

  override isActive(state: EditorState): boolean {
    return this.isMarkActive(state, state.schema.marks.strong)
  }

  override getDefaultKeyCombo(): keyCombo | null {
    return 'ctrl_b' // Ctrl + B
  }
}

export class FormatItalic extends Action {
  static override ID = 'FormatItalic'

  constructor() {
    super({
      name: 'Toggle Italics',
      icon: 'i-heroicons-italic',
    })
  }

  execute(state: EditorState): Transaction | null {
    const toggleItalics = toggleMark(schema.marks.em, null, {})
    return this.getTransaction(toggleItalics, state)
  }

  override isActive(state: EditorState): boolean {
    return this.isMarkActive(state, state.schema.marks.em)
  }

  override getDefaultKeyCombo(): keyCombo | null {
    return 'ctrl_i' // Ctrl + I
  }
}

export const actionGroup: ActionGroup = {
  name: 'Formatting',
  actions: [
    FormatBold.ID,
    FormatItalic.ID,
  ]
}