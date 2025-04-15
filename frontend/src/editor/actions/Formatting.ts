/**
 * Implements text formatting actions: bold, italics, etc.
 */
import { type EditorState, type Transaction } from 'prosemirror-state'
import { toggleMark } from 'prosemirror-commands'
import type { actionID, alignmentType, keybind } from '../Editor'
import type { Group, GroupAction, GroupActionMenu, GroupItem } from '../Toolbar'
import { schema } from '../Schema'
import { Action } from './Action'

export class FormatBold extends Action {
  static ID = 'FormatBold'

  constructor() {
    super(FormatBold.ID)
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
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
  static ID = 'FormatItalic'

  constructor() {
    super(FormatItalic.ID)
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
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
  static ID = 'FormatUnderline'

  constructor() {
    super(FormatUnderline.ID)
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
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
  static ID = 'FormatInlineCode'

  constructor() {
    super(FormatInlineCode.ID)
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
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

export class FormatLink extends Action {
  static ID = 'FormatLink'

  constructor() {
    super(FormatLink.ID)
  }

  execute(state: EditorState, params: {href: string, title: string}): Transaction | Promise<Transaction> | null {
    const toggleLink = toggleMark(schema.marks.link, params)
    const cursor = state.selection

    // If there is no text selected, select the word at the cursor and apply the link to it
    if (cursor.from == cursor.to) {
      // Create new selection around the word
      const selection = ProseMirrorUtils.selectWord(state)
      let tr = state.tr
      tr = tr.setSelection(selection)

      // Add link mark to selection
      tr = tr.addMark(selection.from, selection.to, schema.marks.link.create(params))

      return tr
    } else { // Otherwise apply link to whole selection
      return this.getTransaction(toggleLink, state)
    }
  }

  override isActive(state: EditorState): boolean {
    return this.isMarkActive(state, state.schema.marks.code)
  }

  override getDefaultKeyCombo(): keybind | null {
    return null
  }
}

export class SetAlignment extends Action {
  /* Extend as necessary. */
  static ICONS: {[key: string]: string} = {
    'left': 'material-symbols:format-align-left',
    'right': 'material-symbols:format-align-right',
    'center': 'material-symbols:format-align-center',
    'justify': 'material-symbols:format-align-justify',
  }

  private type: alignmentType

  constructor(alignment: alignmentType) {
    super(`SetAlignment.${alignment}`)
    this.type = alignment
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    const range = this.getNodeRange(state)
    let tr = state.tr
    tr.setNodeAttribute(range.start, 'align', this.type)
    return tr
  }

  override isActive(state: EditorState): boolean {
    // It's somewhat annoying to have the correponding button in the UI basically always highlighted due to this
    // return this.selectionHasNode(state, schema.nodes['paragraph'], {align: this.type}) !== null
    return false
  }
}

/**
 * Action group
 */
const _alignmentActionItems: GroupItem[] = []
const _alignmentActions: Action[] = []
for (const alignType of ['right', 'left', 'center', 'justify']) {
  const action = new SetAlignment(alignType as alignmentType)
  _alignmentActions.push(action)
  _alignmentActionItems.push({
    type: 'action',
    def: {
      name: StringUtils.capitalize(alignType),
      longName: `Align ${alignType}`,
      icon: SetAlignment.ICONS[alignType],
    },
    id: action.id,
  })
}
export const alignmentActions = _alignmentActions
export const actionGroup: Group = {
  name: 'Formatting',
  items: [
    {
      type: 'action',
      id: FormatBold.ID,
      def: {
        name: 'Toggle Bold',
        icon: 'i-heroicons-bold',
      },
    } as GroupAction,
    {
      type: 'action',
      id: FormatItalic.ID,
      def: {
        name: 'Toggle Italics',
        icon: 'i-heroicons-italic',
      },
    } as GroupAction,
    {
      type: 'action',
      id: FormatUnderline.ID,
      def: {
        name: 'Toggle Underline',
        icon: 'i-heroicons-underline',
      },
    } as GroupAction,
    {
      type: 'action',
      id: FormatInlineCode.ID,
      def: {
        name: 'Toggle Inline Code',
        icon: 'i-material-symbols-code-rounded',
      },
    } as GroupAction,
    {
      type: 'actionMenu',
      id: 'formatting.alignment.menu',
      def: {
        icon: 'material-symbols:format-align-left',
        name: 'Set Alignment',
      },
      subitems: _alignmentActionItems,
    } as GroupActionMenu,
    {
      type: 'action',
      id: FormatLink.ID,
      def: {
        name: 'Set Link',
        icon: 'material-symbols:link',
      },
    } as GroupAction,
  ]
}