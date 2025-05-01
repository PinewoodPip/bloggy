<!-- Context menu for an editor document. -->
<template>
  <ContextMenu v-model="contextMenuOpen" :items="contextMenuItems" />
</template>

<script setup lang="ts">
import ContextMenu from '~/components/context-menu/ContextMenu.vue'
import * as Tools from '~/src/editor/ToolManager'

const { useTool } = useEditorTools()
const { getContextMenuItems } = useEditorContextMenu('context-menu')

const emit = defineEmits<{
  useAction: [Tools.toolIdentifier]
}>();

const contextMenuOpen = ref(false)
const contextMenuItems: Ref<object[][]> = ref([])

/** Opens the context menu at the cursor's position. */
function open() {
  const items = getContextMenuItems() // Cannot be made reactive, as it depends on PM document state

  // Add Nuxt dropdown click handler to items
  for (const itemGroup of items) {
    for (const item of itemGroup) {
      // @ts-ignore
      item.click = () => {
        emit('useAction', item.item.id)
        useTool(item.item)
      }
    }
  }

  contextMenuItems.value = items
  contextMenuOpen.value = true
}

defineExpose({
  open,
})

</script>