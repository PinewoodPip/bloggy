import * as Editor from '~/src/editor/Editor'
import * as FormattingTools from '~/src/editor/tools/Formatting';
import * as HistoryTools from '~/src/editor/tools/History';
import * as SectioningTools from '~/src/editor/tools/Sectioning';
import * as ClipboardTools from '~/src/editor/tools/Clipboard';
import * as MediaTools from '~/src/editor/tools/Media';
import * as ListTools from '~/src/editor/tools/Lists';
import * as WidgetTools from '~/src/editor/tools/Widgets';
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
  const toolManager = editor.getToolManager()
  const schema = editor.schema

  // History actions
  const { undoTool: undo, redoTool: redo } = HistoryTools.RegisterHistoryActions(editor)

  // Formatting actions
  const bold = FormattingTools.RegisterFormatBold(editor, schema.marks.strong)
  const italic = FormattingTools.RegisterFormatItalics(editor, schema.marks.em)
  const underline = FormattingTools.RegisterFormatUnderline(editor, schema.marks.underline)
  const inlineCode = FormattingTools.RegisterFormatInlineCode(editor, schema.marks.code)
  // const link = FormattingTools.RegisterFormatLink(editor, schema.marks.link) // Too abusable

  // Sectioning actions
  const quote = SectioningTools.RegisterQuoteTool(editor)

  // Clipboard tools
  const clipboardTools = ClipboardTools.RegisterClipboardTools(editor)

  // Media tools
  const emojiPicker = MediaTools.RegisterEmojiPickerTool(editor)

  // Widget actions
  const annotation = WidgetTools.RegisterAnnotationTool(editor)

  // Define toolbar
  toolManager.registerToolGroup({
    id: 'toolbar',
    toolPalettes: [
      // History
      {
        name: 'History',
        tools: [
          undo.id,
          redo.id, 
        ],
      },
      // Clipboard
      {
        name: 'Clipboard',
        tools: [
          clipboardTools.cutTool.id,
          clipboardTools.copyTool.id,
          clipboardTools.pasteTool.id,
        ],
      },
      // Formatting
      {
        name: 'Formatting',
        tools: [
          bold.id,
          italic.id,
          underline.id,
          inlineCode.id,
          // link.id, // Too abusable; TODO only allow for editors?
        ],
      },
      // Sectioning
      {
        name: 'Sectioning',
        tools: [
          quote.id,
        ],
      },
      // Media
      {
        name: 'Media',
        tools: [
          emojiPicker.id,
        ],
      },
    ]
  })

  // Define context menu
  toolManager.registerToolGroup({
    id: 'context-menu',
    toolPalettes: [
      // Clipboard
      {
        name: 'Clipboard',
        tools: [
          clipboardTools.cutTool.id,
          clipboardTools.copyTool.id,
          clipboardTools.pasteTool.id,
        ],
      },
      // Formatting
      // TODO only allow for editors?
      // {
      //   name: 'Formatting',
      //   tools: [
      //     link.id,
      //   ],
      // },
      // Media
      {
        name: 'Media',
        tools: [
          emojiPicker.id,
          annotation.id,
        ],
      },
    ]
  })

  // Misc actions
  editor.registerAction('InsertText', new MiscActions.InsertText())
  editor.registerAction('DeleteSelection', new MiscActions.DeleteSelection())

  return editor
}