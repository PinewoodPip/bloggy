/**
 * Editor tool definitions for inserting sectioning elements (horizontal rule, headings...).
 */

import * as Editor from '~/src/editor/Editor'
import * as Tools from "~/src/editor/ToolManager"
import * as HistoryActions from '~/src/editor/actions/History'
import { RegisterActionTool } from "./Generic"
import type { Action } from '../actions/Action'
import { SetHeading, MakeQuote, InsertHorizontalRule } from '../actions/Sectioning'

const MAX_HEADING_LEVEL = 6

/** Registers a tool to insert a quote. */
export const RegisterQuoteTool = (editor: Editor.Editor) => {
  const action = new MakeQuote()
  return RegisterActionTool(editor, action, {
    name: 'Make Quote',
    icon: 'i-material-symbols-format-quote',
  })
}

/** Registers a tool to insert a horizontal rule. */
export const RegisterHorizontalRuleTool = (editor: Editor.Editor) => {
  const action = new InsertHorizontalRule()
  return RegisterActionTool(editor, action, {
    name: 'Insert Horizontal Rule',
    icon: 'i-material-symbols-horizontal-rule',
  })
}

/** Registers tools for undo & redo. */
export const RegisterHeadingTools = (editor: Editor.Editor) => {
  const toolbar = editor.getToolManager()
  const _headingActions: Action[] = []
  const tools: Tools.Tool[] = []

  // Create actions and tools for each heading level
  for (let i = 1; i <= MAX_HEADING_LEVEL; ++i) {
    const action = new SetHeading(i)
    _headingActions.push(action)
    const tool = RegisterActionTool(editor, action, {
        name: `Set Heading ${i}`,
        icon: 'i-material-symbols-h-mobiledata-badge-outline', // TODO better icon
    })
    tools.push(tool)
  }

  // Register menu with all heading tools
  const menuTool = new Tools.MenuTool('sectioning.heading.menu', {
    icon: 'i-material-symbols-h-mobiledata-badge-outline',
    name: 'Set Heading',
  }, tools)
  toolbar.registerTool(menuTool)

  return menuTool
}