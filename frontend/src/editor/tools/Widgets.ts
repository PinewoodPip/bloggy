/**
 * Editor tool definitions for inserting lists.
 */

import * as Editor from '~/src/editor/Editor'
import * as Tools from "~/src/editor/ToolManager"
import { RegisterActionTool, RegisterMenuTool } from "./Generic"
import * as WidgetActions from '~/src/editor/actions/Widgets'

/** Registers tools to toggle notes. */
export const RegisterNoteTools = (editor: Editor.Editor) => {
  // Create actions
  const tools: Tools.Tool[] = []
  let _alertActions: WidgetActions.InsertAlert[] = [
    new WidgetActions.InsertAlert('note'),
    new WidgetActions.InsertAlert('tip'),
    new WidgetActions.InsertAlert('important'),
    new WidgetActions.InsertAlert('caution'),
    new WidgetActions.InsertAlert('warning'),
  ]
  for (const action of _alertActions) {
    tools.push(RegisterActionTool(editor,
      action, {
        name: `Toggle ${action.alertType} note`,
        icon: 'material-symbols:lightbulb-2-outline', // TODO different icon per type
      })
    )
  }

  // Register menu
  const menu = RegisterMenuTool(editor,
    new Tools.MenuTool('widgets.note.menu', {
      icon: 'material-symbols:lightbulb-2-outline',
      name: 'Toggle Note',
    },
    tools)
  )

  return { menu, tools }
}

/** Registers a tool to toggle a code block. */
export const RegisterCodeBlockTool = (editor: Editor.Editor) => {
  return RegisterActionTool(editor, new WidgetActions.InsertCodeBlock(), {
    name: 'Toggle Code Block',
    icon: 'material-symbols:code-blocks-outline',
  })
}

/** Registers a tool to insert footnotes. */
export const RegisterFootnoteTool = (editor: Editor.Editor) => {
  return RegisterActionTool(editor, new WidgetActions.InsertFootnote(), {
    name: 'Insert Footnote',
    icon: 'material-symbols:edit-note',
  })
}