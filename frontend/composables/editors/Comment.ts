import * as Editor from '~/src/editor/Editor'
import * as HistoryActions from '~/src/editor/actions/History'
import * as FormattingActions from '~/src/editor/actions/Formatting'
import * as SectioningActions from '~/src/editor/actions/Sectioning'
import * as MiscActions from '~/src/editor/actions/Misc'
import type { EditorView } from 'prosemirror-view'
import { schema as CommentEditorSchema } from '~/src/editor/schemas/Comment'
import type { ActionTool } from '~/src/editor/ToolManager'

/**
 * An editor setup for writing article comments.
 * Features only minimal formatting.
 */
export const useCommentEditor = (pmViewGetter: () => EditorView) => {
  // Create editor
  const editor: Editor.Editor = new Editor.Editor(CommentEditorSchema, pmViewGetter)
  const toolbar = editor.getToolManager()
  const schema = editor.schema

  // Add default actions and groups

  // History actions
  editor.registerAction(new HistoryActions.Undo())
  editor.registerAction(new HistoryActions.Redo())
  toolbar.registerToolGroup(HistoryActions.actionGroup)

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
  toolbar.registerToolGroup(FormattingActions.actionGroup)

  editor.registerAction(new SectioningActions.MakeQuote())
  toolbar.registerToolGroup({
    id: 'Sectioning',
    toolPalettes: [
      {
        type: 'action',
        id: SectioningActions.MakeQuote.ID,
        def: {        
          name: 'Insert Quote',
          icon: 'i-material-symbols-format-quote',
        },
      } as ActionTool,
    ]
  })

  // Misc actions
  editor.registerAction(new MiscActions.InsertText())
  editor.registerAction(new MiscActions.DeleteSelection())

  // Clipboard actions
  toolbar.registerToolGroup(ClipboardActions.actionGroup)

  return editor
}