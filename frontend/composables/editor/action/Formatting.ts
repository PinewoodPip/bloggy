/**
 * Implements text formatting actions: bold, italics, etc.
 */
import type { EditorState, Transaction } from 'prosemirror-state'
import { toggleMark } from 'prosemirror-commands'
import type { ActionGroup, keyCombo } from '../Editor'
import { schema } from '../Schema'
import { Action } from './Action'

export class FormatBold extends Action {
  static override ID = 'FormatBold'

  constructor() {
    super({
      id: 'FormatBold',
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
      id: 'FormatItalic',
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

export class FormatUnderline extends Action {
  static override ID = 'FormatUnderline'

  constructor() {
    super({
      id: 'FormatUnderline',
      name: 'Toggle Underline',
      icon: 'i-heroicons-underline',
    })
  }

  execute(state: EditorState): Transaction | null {
    const toggleUnderline = toggleMark(schema.marks.underline, null, {}) // TODO extract this helper
    return this.getTransaction(toggleUnderline, state)
  }

  override isActive(state: EditorState): boolean {
    return this.isMarkActive(state, state.schema.marks.underline)
  }

  override getDefaultKeyCombo(): keyCombo | null {
    return 'ctrl_u' // Ctrl + U
  }
}

export const actionGroup: ActionGroup = {
  name: 'Formatting',
  actions: [
    FormatBold.ID,
    FormatItalic.ID,
    FormatUnderline.ID,
  ]
}