/**
 * Viewmodel composables for editor toolbar items.
 */
import type * as Tools from '~/src/editor/ToolManager'

/** Viewmodel for a toolbar ActionMenu item. */
export const useEditorMultiTool = (menuGetter: () => Tools.MultiTool, onUse: (item: Tools.Tool) => void) => {
  const { editor, editorState, tools } = useEditorInjects()
  const menu = computed(() => menuGetter())

  /** NuxtUI dropdown menu items. */
  const menuItems = computed(() => {
    const items = []
    for (const subitem of menu.value.subitems) {
      // Only include tools the user set as visible
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
    return editorState.value && menu.value.isActive(editorState.value)
  })

  return {menuItems, isActive}
}

/** Viewmodel for a toolbar Callback item. */
export const useEditorTool = (item: Ref<Tools.CallbackTool>) => {
  const { editor, editorState } = useEditorInjects()
  const keybindStringifier = useKeybindStringifier()

  const keybindLabel = computed(() => {
    const keybind = editor.value.getToolKeybind(item.value.id)
    return keybind ? keybindStringifier.stringify(keybind) : null
  })

  const isActive = computed(() => {
    return editorState.value && toRaw(editor.value).isToolActive(editorState.value, item.value)
  })

  const isApplicable = computed(() => {
    return item.value.isApplicable(editorState.value)
  })

  return { keybindLabel, isActive, isApplicable }
}