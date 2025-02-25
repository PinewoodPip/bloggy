/**
 * Implements text formatting actions: bold, italics, etc.
 */
import type { EditorState, NodeSelection, Transaction } from 'prosemirror-state'
import { schema } from 'prosemirror-schema-basic'
import { toggleMark } from 'prosemirror-commands'
import type { ActionGroup } from '../Editor'
import { Action } from './Action'

class FormatBold extends Action {
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
}

class FormatItalic extends Action {
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
}

const actionGroup: ActionGroup = {
  name: 'Formatting',
  actions: [
    new FormatBold(),
    new FormatItalic(),
  ]
}
export default actionGroup