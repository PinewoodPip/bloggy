/**
 * Viewmodel composables for creating editor context menu components.
 */
import type * as Toolbar from '~/src/editor/Toolbar'
import * as ClipboardActions from '~/src/editor/actions/Clipboard'
import * as MediaActions from '~/src/editor/actions/Media'

type ContextMenuItem = NuxtDropdownItem & {
  item: Toolbar.GroupItem,
}

export const useEditorContextMenu = () => {
  const { editorState } = useEditorInjects()
  const schema = useEditorSchema()

  /** Options shown in the context menu. */
  function getContextMenuItems() {
    const items: (Toolbar.GroupItem | object)[][] = []

    // Add clipboard actions
    const clipboardItems = []
    for (const item of ClipboardActions.actionGroup.items) {
      clipboardItems.push(item)
    }

    // Add media items
    const mediaItems = []
    mediaItems.push(MediaActions.actionGroup.items.find((item) => item.id === 'media.emoji.request')!)
    // "Edit image" if selection is an image
    if (ProseMirrorUtils.selectionHasNode(editorState.value, schema.nodes.image)) {
      mediaItems.push(MediaActions.contextualItems.editImage)
    }

    items.push(
      clipboardItems,
      mediaItems,
    )

    // Convert items to Nuxt UI dropdown items
    const dropdownItems: ContextMenuItem[][] = []
    for (const arr of items) {
      dropdownItems.push([])
      for (const i in arr) {
        const item = arr[i]
        dropdownItems[dropdownItems.length - 1].push(getActionContextMenuEntry(item as Toolbar.GroupItem))
      }
    }

    return dropdownItems
  }

  /** Creates a context menu item for a toolbar item. */
  function getActionContextMenuEntry(item: Toolbar.GroupItem): ContextMenuItem {
    return {
      label: item.def.name,
      icon: item.def.icon,
      item: item,
    }
  }

  return { getContextMenuItems }
}