/**
 * Editor tool definitions for formatting-related operations.
 */
import * as Editor from "~/src/editor/Editor"
import * as Tools from "~/src/editor/ToolManager"
import * as FormattingActions from '~/src/editor/actions/Formatting'
import { MarkType, NodeType } from 'prosemirror-model'
import type { alignmentType } from "../Editor"
import { RegisterActionTool } from "./Generic"

/** Registers a tool to format text as bold. */
export const RegisterFormatBold = (editor: Editor.Editor, markType: MarkType) => {
  return RegisterActionTool(
    editor,
    new FormattingActions.ToggleMark('ToggleBold', markType, 'ctrl_b'),
    {
      name: 'Toggle Bold',
      icon: 'i-heroicons-bold',
    },
  )
} 

/** Registers a tool to format text as italics. */
export const RegisterFormatItalics = (editor: Editor.Editor, markType: MarkType) => {
  return RegisterActionTool(
    editor,
    new FormattingActions.ToggleMark('ToggleItalic', markType, 'ctrl_i'),
    {
      name: 'Toggle Italics',
      icon: 'i-heroicons-italic',
    },
  )
}

/** Registers a tool to format text as underlined. */
export const RegisterFormatUnderline = (editor: Editor.Editor, markType: MarkType) => {    
  return RegisterActionTool(
    editor,
    new FormattingActions.ToggleMark('ToggleUnderline', markType, 'ctrl_u'),
    {
      name: 'Toggle Underline',
      icon: 'i-heroicons-underline',
    },
  )
}

/** Registers a tool to format text as inline code. */
export const RegisterFormatInlineCode = (editor: Editor.Editor, markType: MarkType) => {
  return RegisterActionTool(
    editor,
    new FormattingActions.ToggleMark('ToggleInlineCode', markType),
    {
      name: 'Toggle Inline Code',
      icon: 'i-material-symbols-code-rounded',
    },
  )
}

/** Registers a tool that sets a link for text. */
export const RegisterFormatLink = (editor: Editor.Editor, markType: MarkType) => {
  const action = new FormattingActions.ToggleWordMark('ToggleLink', markType)
  editor.registerAction('ToggleLink', action)
  const tool = new Tools.CallbackTool('SetLink', {
    name: 'Set Link',
    icon: 'material-symbols:link',
  })
  editor.getToolManager().registerTool(tool)
  return tool
}

/** Registers a tool to set the alignment of a paragraph. */
export const RegisterFormatAlignment = (editor: Editor.Editor, alignment: alignmentType) => {
  return RegisterActionTool(
    editor, 
    new FormattingActions.SetAlignment(alignment),
    {
      name: StringUtils.capitalize(alignment),
      icon: FormattingActions.SetAlignment.ICONS[alignment],
    },
  )
}

/** Paragraph alignment types. */
export const ALIGN_TYPES: alignmentType[] = ['right', 'left', 'center', 'justify']

/** Registers a menu tool to set paragraph alignment. */
export const RegisterAlignmentMenu = (editor: Editor.Editor, alignmentActions?: Tools.ActionTool[]) => {
  const tools: Tools.ActionTool[] = alignmentActions || []
  // Create tools for each align type if not specified by user
  for (const alignType of ALIGN_TYPES) {
    const tool = RegisterFormatAlignment(editor, alignType)
    tools.push(tool)
  }
  const menu = new Tools.MenuTool(
    'formatting.alignment.menu',
    {
      icon: 'material-symbols:format-align-left',
      name: 'Set Alignment',
    },
    tools,
  )
  editor.getToolManager().registerTool(menu)
  return menu
}