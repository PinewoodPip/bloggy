/**
 * Editor tool definitions for inserting lists.
 */

import * as Editor from '~/src/editor/Editor'
import * as Tools from "~/src/editor/ToolManager"
import { RegisterActionTool, RegisterCallbackTool, RegisterMenuTool } from "./Generic"
import * as WidgetActions from '~/src/editor/actions/Widgets'

/** Registers tools to toggle notes. */
export const RegisterNoteTools = (editor: Editor.Editor) => {
  // Create actions
  const tools: Tools.Tool[] = []
  const schema = editor.schema
  const node = schema.nodes.alert
  let _alertActions: WidgetActions.ToggleNodeWithAttrs[] = [
    new WidgetActions.ToggleNodeWithAttrs('alert.insert.note', node, {type: 'note'}),
    new WidgetActions.ToggleNodeWithAttrs('alert.insert.tip', node, {type: 'tip'}),
    new WidgetActions.ToggleNodeWithAttrs('alert.insert.important', node, {type: 'important'}),
    new WidgetActions.ToggleNodeWithAttrs('alert.insert.caution', node, {type: 'caution'}),
    new WidgetActions.ToggleNodeWithAttrs('alert.insert.warning', node, {type: 'warning'}),
  ]
  for (const action of _alertActions) {
    tools.push(RegisterActionTool(editor,
      action, {
        name: `Toggle ${(action.attrs as Editor.AlertAttrs).type} note`,
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

/** Registers a tool to request adding an annotation. */
export const RegisterAnnotationTool = (editor: Editor.Editor) => {
  return RegisterCallbackTool(editor, {
    type: 'callback',
    id: 'annotation.request',
    def: {
      name: 'Insert Annotation',
      icon: 'material-symbols:comment',
    }
  })
}