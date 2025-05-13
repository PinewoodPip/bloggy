/**
 * Editor tool definitions for inserting lists.
 */

import * as Editor from '~/src/editor/Editor'
import * as Tools from "~/src/editor/ToolManager"
import { RegisterActionTool, RegisterCallbackTool, RegisterMenuTool } from "./Generic"
import * as WidgetActions from '~/src/editor/actions/Widgets'
import type { EditorState } from 'prosemirror-state'

const NOTE_ICONS = {
  note: 'material-symbols:lightbulb-2-outline',
  tip: 'material-symbols:tips-and-updates',
  important: 'material-symbols:error',
  // caution: 'material-symbols:lightbulb-2-outline', // Removed; was unnecessary.
  warning: 'material-symbols:warning-rounded',
}

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
    // new WidgetActions.ToggleNodeWithAttrs('alert.insert.caution', node, {type: 'caution'}), // Removed; was unnecessary.
    new WidgetActions.ToggleNodeWithAttrs('alert.insert.warning', node, {type: 'warning'}),
  ]
  for (const action of _alertActions) {
    const noteType = (action.attrs as Editor.AlertAttrs).type
    tools.push(RegisterActionTool(editor,
      action, {
        name: noteType === 'note' ? 'Toggle note' : `Toggle ${noteType} note`, // Avoid double "note" string
        icon: NOTE_ICONS[noteType],
      })
    )
  }

  // Register menu
  const menu = RegisterMenuTool(editor,
    new Tools.MultiTool('widgets.note.menu', {
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
    name: 'Add Footnote',
    icon: 'material-symbols:edit-note',
  })
}

export class RequestAnnotationTool extends Tools.CallbackTool {
  action: Editor.IAction
  constructor() {
    super('annotation.request', {
      name: 'Add Annotation',
      icon: 'material-symbols:comment',
    })
    this.action = new WidgetActions.SetAnnotation()
  }

  override isApplicable(state: EditorState): boolean {
    return this.action.isApplicable(state)
  }
}

/** Registers a tool to request adding an annotation. */
export const RegisterAnnotationTool = (editor: Editor.Editor) => {
  return RegisterCallbackTool(editor, new RequestAnnotationTool())
}