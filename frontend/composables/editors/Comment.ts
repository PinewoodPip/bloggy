import * as Editor from '~/src/editor/Editor'
import * as HistoryActions from '~/src/editor/actions/History'
import * as FormattingActions from '~/src/editor/actions/Formatting'
import * as SectioningActions from '~/src/editor/actions/Sectioning'
import * as ClipboardActions from '~/src/editor/actions/Clipboard'
import * as MiscActions from '~/src/editor/actions/Misc'
import type { EditorView } from 'prosemirror-view'
import { schema as CommentEditorSchema } from '~/src/editor/schemas/Comment'
import type { GroupAction } from '~/src/editor/Toolbar'

/**
 * An editor setup for writing article comments.
 * Features only minimal formatting.
 */
export const useCommentEditor = (pmViewGetter: () => EditorView) => {
  // Create editor
  const editor: Editor.Editor = new Editor.Editor(CommentEditorSchema, pmViewGetter)
  const toolbar = editor.getToolbar()
  const schema = editor.schema

  // Add default actions and groups

  // History actions
  editor.registerAction(new HistoryActions.Undo())
  editor.registerAction(new HistoryActions.Redo())
  toolbar.registerToolbarGroup(HistoryActions.actionGroup)

  // Formatting actions
  editor.registerAction(new FormattingActions.ToggleMark('ToggleBold', schema.marks.strong, 'ctrl_b'))
  editor.registerAction(new FormattingActions.ToggleMark('ToggleItalic', schema.marks.em, 'ctrl_i'))
  editor.registerAction(new FormattingActions.ToggleMark('ToggleUnderline', schema.marks.underline, 'ctrl_u'))
  editor.registerAction(new FormattingActions.ToggleMark('ToggleInlineCode', schema.marks.code))
  editor.registerAction(new FormattingActions.ToggleWordMark('ToggleLink', schema.marks.link))
  // TODO remove?
  for (const action of FormattingActions.alignmentActions) {
    editor.registerAction(action)
  }
  toolbar.registerToolbarGroup(FormattingActions.actionGroup)

  editor.registerAction(new SectioningActions.MakeQuote())
  toolbar.registerToolbarGroup({
    name: 'Sectioning',
    items: [
      {
        type: 'action',
        id: SectioningActions.MakeQuote.ID,
        def: {        
          name: 'Insert Quote',
          icon: 'i-material-symbols-format-quote',
        },
      } as GroupAction,
    ]
  })

  // Misc actions
  editor.registerAction(new MiscActions.InsertText())
  editor.registerAction(new MiscActions.DeleteSelection())

  // Clipboard actions
  toolbar.registerToolbarGroup(ClipboardActions.actionGroup)

  return editor
}