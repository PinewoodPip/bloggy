<!-- Context menu for an editor document. -->
<template>
  <ContextMenu v-model="contextMenuOpen" :items="contextMenuItems" />
</template>

<script setup lang="ts">
import ContextMenu from '~/components/context-menu/ContextMenu.vue'
import * as Toolbar from '~/src/editor/Toolbar'
import * as ClipboardActions from '~/src/editor/actions/Clipboard'

const emit = defineEmits<{
  useAction: [Toolbar.actionGroupItemIdentifier]
}>();

const contextMenuOpen = ref(false)

/** Opens the context menu at the cursor's position. */
function open() {
  contextMenuOpen.value = true
}

defineExpose({
  open,
})

/** Options shown in the context menu. */
const contextMenuItems = computed(() => {
  const items: object[][] = []

  // Add clipboard actions
  const clipboardItems = []
  for (const item of ClipboardActions.actionGroup.items) {
    clipboardItems.push(getActionContextMenuEntry(item))
  }

  items.push(clipboardItems)
  return items
})

function getActionContextMenuEntry(item: Toolbar.GroupItem): object {
  return {
    label: item.def.name,
    icon: item.def.icon,
    click: () => {
      emit('useAction', item.id)
    },
  }
}

</script>