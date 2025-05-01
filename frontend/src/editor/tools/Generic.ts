/**
 * Generic editor tools and utility functions for registering them.
 */
import * as Editor from "~/src/editor/Editor"
import * as Tools from "~/src/editor/ToolManager"
import { MarkType, NodeType } from 'prosemirror-model'

/** Simultaneously registers an action tool and its corresponding action for independent use. */
export const RegisterActionTool = (manager: Editor.Editor, action: Editor.IAction, toolDef: Tools.ToolDef) => {
  const tool = new Tools.ActionTool(action, toolDef)
  manager.registerAction(tool.id, tool.action)
  manager.getToolManager().registerTool(tool)
  return tool
}

/** Registers a callback-type tool. */
export const RegisterCallbackTool = (manager: Editor.Editor, tool: Tools.CallbackTool) => {
  manager.getToolManager().registerTool(tool)
  return tool
}

/** Registers a menu tool. */
export const RegisterMenuTool = (manager: Editor.Editor, tool: Tools.MenuTool) => {
  manager.getToolManager().registerTool(tool)
  return tool
}