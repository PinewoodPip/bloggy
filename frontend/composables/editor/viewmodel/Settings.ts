/**
 * Viewmodel composables for creating setting menus for user preferences.
 */
import type { keybind } from '~/src/editor/Editor'
import type * as Toolbar from '~/src/editor/Toolbar'

/** Viewmodel composable for fetching and updating user editor & toolbar preferences. */
export const useEditorSettings = () => {
  const { editor, toolbar } = useEditorInjects()

  return {
    /** Returns the items of a group that should be user-configurable. */
    getGroupItems(group: Toolbar.Group): Toolbar.GroupItem[] {
      const items: Toolbar.GroupItem[] = []
      for (const item of group.items) {
        if (item.type === 'action' || item.type === 'callback') {
          items.push(item)
        } else if (item.type === 'actionMenu') {
          // Add all subitems
          for (const subitem of (item as Toolbar.GroupActionMenu).subitems) {
            items.push(subitem)
          }
        }
      }
      return items
    },

    /** Sets the keybind for an item. */
    setItemKeybind(item: Toolbar.GroupItem, keybind: keybind) {
      // Clear keybind of the previous action bound to it
      if (keybind) {
        const previousAction = editor.value.getItemForKeybind(keybind)
        if (previousAction) {
          editor.value.setItemKeybind(previousAction.id, null)
        }
      }
      // Set new keybind
      editor.value.setItemKeybind(item.id, keybind)

      // Persist settings
      editor.value.savePreferences("ArticleEditor")
    },
  
    /** Returns whether an action's keybind is the default one. */
    isKeybindDefault(actionID: string) {
      const defaultKeybind = editor.value.getDefaultItemKeybind(actionID)
      const currentKeybind = editor.value.getItemKeybind(actionID)
      return defaultKeybind === currentKeybind
    },
  
    /** Sets visibility and saves preferences. */
    setItemVisibility(item: Toolbar.GroupItem, visible: boolean) {
      toolbar.value.setItemVisible(item.id, visible)
      editor.value.savePreferences("ArticleEditor")
    },
    
    /** Resets an item's keybind to its default. */
    resetKeybind(item: Toolbar.GroupItem) {
      const defaultKeybind = editor.value.getDefaultItemKeybind(item)
      editor.value.setItemKeybind(item.id, defaultKeybind)
    },
  }
}