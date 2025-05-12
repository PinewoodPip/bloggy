/**
 * Editor tool definitions for inserting lists.
 */

import * as Editor from '~/src/editor/Editor'
import * as Tools from "~/src/editor/ToolManager"
import * as ListActions from '~/src/editor/actions/Lists'
import { RegisterActionTool } from "./Generic"

/** Registers tools for toggling lists. */
export const RegisterListTools = (editor: Editor.Editor) => {
  // Create actions
  const toggleBulletListAction = new ListActions.ToggleBulletList()
  const toggleNumberedListAction = new ListActions.ToggleNumberedList()

  // Create tools
  const toggleBulletListTool = RegisterActionTool(editor, toggleBulletListAction, {
    name: 'Toggle Bullet List',
    icon: 'material-symbols:format-list-bulleted',
  })
  const toggleNumberedListTool = RegisterActionTool(editor, toggleNumberedListAction, {
    name: 'Toggle Numbered List',
    icon: 'material-symbols:format-list-numbered',
  })

  // Register menu and tools
  const menu = new Tools.MultiTool(
    'lists.menu',
    {
      icon: 'material-symbols:format-list-bulleted',
      name: 'Toggle List',
    },
    [toggleBulletListTool, toggleNumberedListTool],
  )

  return { menu, toggleBulletListTool, toggleNumberedListTool }
}