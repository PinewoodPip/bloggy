<!-- Context menu for an editor document. -->
<template>
  <ContextMenu v-model="contextMenuOpen" :items="contextMenuItems" />
</template>

<script setup lang="ts">
import ContextMenu from '~/components/context-menu/ContextMenu.vue'
import * as Toolbar from '~/src/editor/Toolbar'

const { useItem } = useEditorToolbar()
const { getContextMenuItems } = useEditorContextMenu()

const emit = defineEmits<{
  useAction: [Toolbar.actionGroupItemIdentifier]
}>();

const contextMenuOpen = ref(false)
const contextMenuItems: Ref<object[][]> = ref([])

/** Opens the context menu at the cursor's position. */
function open() {
  const items = getContextMenuItems() // Cannot be made reactive, as it depends on PM document state

  // Add Nuxt dropdown click handler to items
  for (const item of items) {
    // @ts-ignore
    item.click = () => {
      emit('useAction', item.item.id)
      useItem(item.item)
    }
  }

  contextMenuOpen.value = true
}

defineExpose({
  open,
})

</script>