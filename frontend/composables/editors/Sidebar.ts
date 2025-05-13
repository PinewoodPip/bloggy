/**
 * Editor for the site's sidebar.
 * Supports most of the rich content from the article editor,
 * except elements intended for collaborative editing.
 */
import * as Editor from '~/src/editor/Editor'
import * as MediaActions from '~/src/editor/actions/Media'
import * as MiscActions from '~/src/editor/actions/Misc'
import type { EditorView } from 'prosemirror-view';
import { schema as ArticleEditorSchema } from '~/src/editor/schemas/Article';
import * as FormattingTools from '~/src/editor/tools/Formatting';
import * as HistoryTools from '~/src/editor/tools/History';
import * as SectioningTools from '~/src/editor/tools/Sectioning';
import * as ClipboardTools from '~/src/editor/tools/Clipboard';
import * as MediaTools from '~/src/editor/tools/Media';
import * as ListTools from '~/src/editor/tools/Lists';

/** Creates an editor model for articles, with a rich-text schema and corresponding tools. */
export const useSidebarEditor = (pmViewGetter: () => EditorView) => {
  // Create editor
  const editor: Editor.Editor = new Editor.Editor(ArticleEditorSchema, pmViewGetter)
  const toolManager = editor.getToolManager()
  const schema = editor.schema

  // History actions
  const { undoTool: undo, redoTool: redo } = HistoryTools.RegisterHistoryActions(editor)

  // Formatting actions
  const bold = FormattingTools.RegisterFormatBold(editor, schema.marks.strong)
  const italic = FormattingTools.RegisterFormatItalics(editor, schema.marks.em)
  const underline = FormattingTools.RegisterFormatUnderline(editor, schema.marks.underline)
  const inlineCode = FormattingTools.RegisterFormatInlineCode(editor, schema.marks.code)
  const link = FormattingTools.RegisterFormatLink(editor, schema.marks.link)
  const alignmentMenu = FormattingTools.RegisterAlignmentMenu(editor)

  // Sectioning actions
  const headingTools = SectioningTools.RegisterHeadingTools(editor)
  const horizontalRule = SectioningTools.RegisterHorizontalRuleTool(editor)

  // Clipboard tools
  const clipboardTools = ClipboardTools.RegisterClipboardTools(editor)

  // Media tools
  const imageTools = MediaTools.RegisterArticleImageTools(editor)
  const embed = MediaTools.RegisterEmbedTool(editor)
  const emojiPicker = MediaTools.RegisterEmojiPickerTool(editor)

  // List tools
  const { menu: listMenu, toggleBulletListTool, toggleNumberedListTool } = ListTools.RegisterListTools(editor)

  // Define toolbar
  toolManager.registerToolPalette({
    id: 'toolbar',
    toolGroups: [
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
          link.id,
          alignmentMenu.id,
        ],
      },
      // Sectioning
      {
        name: 'Sectioning',
        tools: [
          headingTools.id,
          horizontalRule.id,
        ],
      },
      // Media
      {
        name: 'Media',
        tools: [
          imageTools.menu.id,
          embed.id,
          emojiPicker.id,
        ],
      },
      // Lists
      {
        name: 'Lists',
        tools: [
          toggleBulletListTool.id,
          toggleNumberedListTool.id,
        ],
      },
    ]
  })

  // Define context menu
  toolManager.registerToolPalette({
    id: 'context-menu',
    toolGroups: [
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
          link.id,
        ],
      },
      // Media
      {
        name: 'Media',
        tools: [
          imageTools.editTool.id,
          emojiPicker.id,
        ],
      },
    ]
  })

  // Misc actions
  editor.registerAction('InsertImage', new MediaActions.InsertImage())
  editor.registerAction('InsertEmbed', new MediaActions.InsertEmbed())
  editor.registerAction('InsertText', new MiscActions.InsertText())

  return editor
}