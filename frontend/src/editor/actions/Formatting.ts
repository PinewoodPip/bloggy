/**
 * Implements text formatting actions: bold, italics, etc.
 */
import type { EditorState, Transaction } from 'prosemirror-state'
import { toggleMark } from 'prosemirror-commands'
import type { ToolbarGroup, ToolbarGroupAction, keybind } from '../Editor'
import { schema } from '../Schema'
import { Action } from './Action'

export class FormatBold extends Action {
  static override ID = 'FormatBold'

  constructor() {
    super({
      id: FormatBold.ID,
      name: 'Toggle Bold',
      icon: 'i-heroicons-bold',
    })
  }

  async execute(state: EditorState): Promise<Transaction | null> {
    const toggleBold = toggleMark(schema.marks.strong, null, {})
    return this.getTransaction(toggleBold, state)
  }

  override isActive(state: EditorState): boolean {
    return this.isMarkActive(state, state.schema.marks.strong)
  }

  override getDefaultKeyCombo(): keybind | null {
    return 'ctrl_b' // Ctrl + B
  }
}

export class FormatItalic extends Action {
  static override ID = 'FormatItalic'

  constructor() {
    super({
      id: FormatItalic.ID,
      name: 'Toggle Italics',
      icon: 'i-heroicons-italic',
    })
  }

  async execute(state: EditorState): Promise<Transaction | null> {
    const toggleItalics = toggleMark(schema.marks.em, null, {})
    return this.getTransaction(toggleItalics, state)
  }

  override isActive(state: EditorState): boolean {
    return this.isMarkActive(state, state.schema.marks.em)
  }

  override getDefaultKeyCombo(): keybind | null {
    return 'ctrl_i' // Ctrl + I
  }
}

export class FormatUnderline extends Action {
  static override ID = 'FormatUnderline'

  constructor() {
    super({
      id: FormatUnderline.ID,
      name: 'Toggle Underline',
      icon: 'i-heroicons-underline',
    })
  }

  async execute(state: EditorState): Promise<Transaction | null> {
    const toggleUnderline = toggleMark(schema.marks.underline, null, {}) // TODO extract this helper
    return this.getTransaction(toggleUnderline, state)
  }

  override isActive(state: EditorState): boolean {
    return this.isMarkActive(state, state.schema.marks.underline)
  }

  override getDefaultKeyCombo(): keybind | null {
    return 'ctrl_u' // Ctrl + U
  }
}

export class FormatInlineCode extends Action {
  static override ID = 'FormatInlineCode'

  constructor() {
    super({
      id: FormatInlineCode.ID,
      name: 'Toggle Inline Code',
      icon: 'i-material-symbols-code-rounded',
    })
  }

  async execute(state: EditorState): Promise<Transaction | null> {
    const toggleInlineCode = toggleMark(schema.marks.code, null, {}) // TODO extract this helper
    return this.getTransaction(toggleInlineCode, state)
  }

  override isActive(state: EditorState): boolean {
    return this.isMarkActive(state, state.schema.marks.code)
  }

  override getDefaultKeyCombo(): keybind | null {
    return null
  }
}

export const actionGroup: ToolbarGroup = {
  name: 'Formatting',
  items: [
    {type: 'action', actionID: FormatBold.ID} as ToolbarGroupAction,
    {type: 'action', actionID: FormatItalic.ID} as ToolbarGroupAction,
    {type: 'action', actionID: FormatUnderline.ID} as ToolbarGroupAction,
    {type: 'action', actionID: FormatInlineCode.ID} as ToolbarGroupAction,
  ]
}