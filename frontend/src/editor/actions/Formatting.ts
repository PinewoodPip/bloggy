/**
 * Implements text formatting actions: bold, italics, etc.
 */
import { type EditorState, type Transaction } from 'prosemirror-state'
import { MarkType, NodeType } from 'prosemirror-model'
import { toggleMark } from 'prosemirror-commands'
import type { actionID, alignmentType, keybind } from '../Editor'
import type { Group, GroupAction, GroupActionMenu, GroupCallback, GroupItem } from '../Toolbar'
import { Action } from './Action'

export class ToggleMark extends Action {
  private markType: MarkType
  private defaultKeybind?: keybind

  constructor(id: string, nodeType: MarkType, defaultKeybind?: string) {
    super(id)
    this.markType = nodeType
    this.defaultKeybind = defaultKeybind
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    const toggleBold = toggleMark(this.markType, null, {})
    return this.getTransaction(toggleBold, state)
  }

  override isActive(state: EditorState): boolean {
    return this.isMarkActive(state, this.markType)
  }

  override getDefaultKeyCombo(): keybind | null {
    return this.defaultKeybind ?? null
  }
}

export class ToggleWordMark extends Action {
  private markType: MarkType

  constructor(id: string, markType: MarkType) {
    super(id)
    this.markType = markType
  }

  execute(state: EditorState, params: {href: string, title: string}): Transaction | Promise<Transaction> | null {
    const toggleLink = toggleMark(this.markType, params)
    const cursor = state.selection

    // If there is no text selected, select the word at the cursor and apply the link to it
    if (cursor.from == cursor.to) {
      // Create new selection around the word
      const selection = ProseMirrorUtils.selectWord(state)
      let tr = state.tr
      tr = tr.setSelection(selection)

      // Add link mark to selection
      tr = tr.addMark(selection.from, selection.to, this.markType.create(params))

      return tr
    } else { // Otherwise apply link to whole selection
      return this.getTransaction(toggleLink, state)
    }
  }

  override isActive(state: EditorState): boolean {
    return this.isMarkActive(state, this.markType)
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
      id: 'ToggleBold',
      def: {
        name: 'Toggle Bold',
        icon: 'i-heroicons-bold',
      },
    } as GroupAction,
    {
      type: 'action',
      id: 'ToggleItalic',
      def: {
        name: 'Toggle Italics',
        icon: 'i-heroicons-italic',
      },
    } as GroupAction,
    {
      type: 'action',
      id: 'ToggleUnderline',
      def: {
        name: 'Toggle Underline',
        icon: 'i-heroicons-underline',
      },
    } as GroupAction,
    {
      type: 'action',
      id: 'ToggleInlineCode',
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
      type: 'callback',
      id: 'SetLink',
      def: {
        name: 'Set Link',
        icon: 'material-symbols:link',
      },
    } as GroupCallback,
  ]
}