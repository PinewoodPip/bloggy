/**
 * Viewmodel composables for creating setting menus for user preferences.
 */
import type { keybind } from '~/src/editor/Editor'
import type * as Tools from '~/src/editor/ToolManager'

/** Viewmodel composable for fetching and updating user editor & toolbar preferences. */
export const useEditorSettings = () => {
  const { editor, tools } = useEditorInjects()

  return {
    /** Returns the items of a group that should be user-configurable. */
    getGroupItems(group: Tools.ToolPalette): Tools.Tool[] {
      const items: Tools.Tool[] = []
      for (const tool of group.tools) {
        const item = tools.value.getTool(tool)
        if (item.type === 'action' || item.type === 'callback') {
          items.push(item)
        } else if (item.type === 'menu') {
          // Push all subitems
          for (const subitem of (item as Tools.MenuTool).subitems) {
            items.push(subitem)
          }
        }
      }
      return items
    },

    /** Sets the keybind for an item. */
    setItemKeybind(item: Tools.Tool, keybind: keybind) {
      // Clear keybind of the previous action bound to it
      if (keybind) {
        const previousAction = editor.value.getItemForKeybind(keybind)
        if (previousAction) {
          editor.value.setToolKeybind(previousAction.id, null)
        }
      }
      // Set new keybind
      editor.value.setToolKeybind(item.id, keybind)

      // Persist settings
      editor.value.savePreferences("ArticleEditor")
    },
  
    /** Returns whether an action's keybind is the default one. */
    isKeybindDefault(actionID: string) {
      const defaultKeybind = editor.value.getDefaultItemKeybind(actionID)
      const currentKeybind = editor.value.getToolKeybind(actionID)
      return defaultKeybind === currentKeybind
    },
  
    /** Sets visibility and saves preferences. */
    setItemVisibility(item: Tools.Tool, visible: boolean) {
      tools.value.setToolVisible(item.id, visible)
      editor.value.savePreferences("ArticleEditor")
    },
    
    /** Resets an item's keybind to its default. */
    resetKeybind(item: Tools.Tool) {
      const defaultKeybind = editor.value.getDefaultItemKeybind(item)
      editor.value.setToolKeybind(item.id, defaultKeybind)
    },
  }
}