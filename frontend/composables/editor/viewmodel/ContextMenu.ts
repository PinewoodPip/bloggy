/**
 * Viewmodel composables for creating editor context menu components.
 */
import type * as Tools from '~/src/editor/ToolManager'

type ContextMenuItem = NuxtDropdownItem & {
  item: Tools.Tool,
}

/** Composable for creating a context menu using Nuxt UI dropdown items out of a ToolPalette, filtering them by relevance based on content at the cursor. */
export const useEditorContextMenu = (paletteID: string) => {
  const { editorState, tools: toolManager } = useEditorInjects()

  /** Options shown in the context menu. */
  function getContextMenuItems() {
    const items: Tools.Tool[][] = []
    const palette = toolManager.value.getToolPalette(paletteID)
    const toolGroups = palette.toolGroups

    for (const group of toolGroups) {
      const groupArr: Tools.Tool[] = []
      items.push(groupArr)
      for (const toolID of group.tools) {
        groupArr.push(toolManager.value.getTool(toolID))
      }
    }

    // Convert items to Nuxt UI dropdown items
    const dropdownItems: ContextMenuItem[][] = []
    for (const arr of items) {
      dropdownItems.push([])
      for (const i in arr) {
        const item = arr[i]
        // Filter items to only contextually-relevant ones
        if (toolManager.value.isToolApplicable(editorState.value, item)) {
          dropdownItems[dropdownItems.length - 1].push(getActionContextMenuEntry(item as Tools.Tool))
        }
      }
    }

    return dropdownItems
  }

  /** Creates a context menu item for a toolbar item. */
  function getActionContextMenuEntry(item: Tools.Tool): ContextMenuItem {
    return {
      label: item.def.name,
      icon: item.def.icon,
      item: item,
    }
  }

  return { getContextMenuItems }
}