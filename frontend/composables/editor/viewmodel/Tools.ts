/**
 * Viewmodel composables for editor toolbar items.
 */
import type * as Tools from '~/src/editor/ToolManager'

/** Viewmodel for a toolbar ActionMenu item. */
export const useToolMenu = (menuGetter: () => Tools.MenuTool, onUse: (item: Tools.Tool) => void) => {
  const { editor, editorState, tools } = useEditorInjects()
  const menu = computed(() => menuGetter())

  /** NuxtUI dropdown menu items. */
  const menuItems = computed(() => {
    const items = []
    for (const subitem of menu.value.subitems) {
      if (tools.value.isToolVisible(subitem.id)) {
        items.push({
          label: subitem.def.name,
          icon: subitem.def.icon,
          click: () => {
            onUse(subitem)
          }
        })
      }
    }
    return [items]
  })

  const isActive = computed(() => {
    return editorState.value && menu.value.subitems.find((subitem) => {
      return editor.value.isItemActive(editorState.value, subitem)
    }) !== undefined
  })

  return {menuItems, isActive}
}

/** Viewmodel for a toolbar Callback item. */
export const useToolbarCallbackItem = (item: Ref<Tools.CallbackTool>) => {
  const { editor, editorState } = useEditorInjects()
  const keybindStringifier = useKeybindStringifier()

  const keybindLabel = computed(() => {
    const keybind = editor.value.getItemKeybind(item.value.id)
    return keybind ? keybindStringifier.stringify(keybind) : null
  })

  const isActive = computed(() => {
    return editorState.value && toRaw(editor.value).isItemActive(editorState.value, item.value)
  })

  return { keybindLabel, isActive }
}