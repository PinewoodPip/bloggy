/**
 * Editor tool definitions for clipboard interactions.
 */
import * as Editor from "~/src/editor/Editor"
import * as Tools from "~/src/editor/ToolManager"
import { MarkType, NodeType } from 'prosemirror-model'
import { RegisterActionTool } from '~/src/editor/tools/Generic'

/** Simultaneously registers an action tool and its corresponding action for independent use. */
export const RegisterClipboardTools = (manager: Editor.Editor) => {
  // Create tools
  const copyTool = new Tools.CallbackTool('ClipboardCopy', {
    name: 'Copy',
    icon: 'i-material-symbols-content-copy',
  })
  const pasteTool = new Tools.CallbackTool('ClipboardPaste', {
    name: 'Paste',
    icon: 'i-material-symbols-content-paste-go',
  })
  const cutTool = new Tools.CallbackTool('ClipboardCut', {
    name: 'Cut',
    icon: 'i-material-symbols-content-cut',
  })

  // Register tools
  const toolbar = manager.getToolManager()
  toolbar.registerTool(copyTool)
  toolbar.registerTool(pasteTool)
  toolbar.registerTool(cutTool)

  return { copyTool, pasteTool, cutTool }
}