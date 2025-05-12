/**
 * Composable for toolbar logic.
 */
import type * as Tools from '~/src/editor/ToolManager'

/** Viewmodel for the ToolManager with a callback to execute items. */
export const useEditorTools = () => {
  const { tools, itemUsedCallbacks } = useEditorInjects()

  /** Throws the ItemUsed callbacks. */
  function useTool(item: Tools.Tool) {
    for (const callback of itemUsedCallbacks.value) {
      callback(item)
    }
  }
  
  return { tools, useTool }
}

/** Composable for toolbar items filtered by user preferences. */
export const useEditorToolbarItems = () => {
  const { editor, tools: toolManager } = useEditorInjects()

  /** Toolbar groups to show, based on user preferences. */
  const visibleGroups = computed(() => {
    const groups: Tools.ToolGroup[] = []
    const group = toolManager.value.getToolPalette('toolbar')
    for (const toolSet of group.toolGroups) {
      // Check if any action in the group is visible
      const visible = getVisibleGroupItems(toolSet).length > 0
      if (visible) {
        groups.push(toolSet)
      }
    }
    return groups
  })

  /** Returns the visible items of a toolbar group. */
  function getVisibleGroupItems(group: Tools.ToolGroup) {
    const items: Tools.Tool[] = []
    for (const id of group.tools) {
      const tool = toolManager.value.getTool(id)
      let visible = false
      if (tool.type === 'action' || tool.type === 'callback') {
        visible = toolManager.value.isToolVisible(tool.id)
      } else if (tool.type === 'multitool') {
        // Menu is visible if any of its subitems is
        const menuActions = (tool as Tools.MultiTool).subitems
        visible = ArrayUtils.anyInArray(menuActions, (item) => {
          return toolManager.value.isToolVisible(item.id)
        })
      } else {
        throw 'Unsupported tool type ' + tool.type
      }
      if (visible) {
        items.push(tool)
      }
    }
    
    return items
  }

  return { visibleGroups, getVisibleGroupItems }
}

/** Registers a callback for when an item is used. */
export const useEditorToolCallback = (callback: Tools.ItemUsedCallback) => {
  const { itemUsedCallbacks } = useEditorInjects()

  itemUsedCallbacks.value.push(callback)
  
  // Remove the callback when the component is destroyed to avoid memory leaks
  onUnmounted(() => {
    itemUsedCallbacks.value.splice(itemUsedCallbacks.value.indexOf(callback), 1)
  })
}
