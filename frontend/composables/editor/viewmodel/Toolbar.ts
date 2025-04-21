/**
 * Composable for toolbar logic.
 */
import type * as Toolbar from '~/src/editor/Toolbar'

/** Viewmodel for the toolbar with a callback to execute items. */
export const useEditorToolbar = () => {
  const { toolbar, itemUsedCallbacks } = useEditorInjects()

  /** Throws the ItemUsed callbacks. */
  function useItem(item: Toolbar.GroupItem) {
    for (const callback of itemUsedCallbacks.value) {
      callback(item)
    }
  }
  
  return { toolbar, useItem }
}

/** Composable for toolbar items filtered by user preferences. */
export const useEditorToolbarItems = () => {
  const { editor, toolbar } = useEditorInjects()

  /** Toolbar groups to show, based on user preferences. */
  const visibleGroups = computed(() => {
    const groups: Toolbar.Group[] = []
    for (const group of toolbar.value.getToolbarGroups()) {
      // Check if any action in the group is visible
      const visible = getVisibleGroupItems(group).length > 0
      if (visible) {
        groups.push(group)
      }
    }
    return groups
  })

  /** Returns the visible items of a toolbar group. */
  function getVisibleGroupItems(group: Toolbar.Group) {
    const items: Toolbar.GroupItem[] = []
    for (const item of group.items) {
      let visible = false
      if (item.type === 'action' || item.type === 'callback') {
        visible = toolbar.value.isItemVisible(item.id)
      } else if (item.type === 'actionMenu') {
        // Menu is visible if any of its subitems is
        const menuActions = (item as Toolbar.GroupActionMenu).subitems
        visible = ArrayUtils.anyInArray(menuActions, (item) => {
          return toolbar.value.isItemVisible(item.id)
        })
      } else {
        throw 'Unsupported item type ' + item.type
      }
      if (visible) {
        items.push(item)
      }
    }
    return items
  }

  return { visibleGroups, getVisibleGroupItems }
}

/** Registers a callback for when an item is used. */
export const useEditorToolbarCallback = (callback: Toolbar.ItemUsedCallback) => {
  const { toolbar, itemUsedCallbacks } = useEditorInjects()

  itemUsedCallbacks.value.push(callback)
  
  // Remove the callback when the component is destroyed to avoid memory leaks
  onUnmounted(() => {
    itemUsedCallbacks.value.splice(itemUsedCallbacks.value.indexOf(callback), 1)
  })
}
