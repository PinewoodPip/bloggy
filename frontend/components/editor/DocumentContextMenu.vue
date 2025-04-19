<!-- Context menu for an editor document. -->
<template>
  <ContextMenu v-model="contextMenuOpen" :items="contextMenuItems" />
</template>

<script setup lang="ts">
import ContextMenu from '~/components/context-menu/ContextMenu.vue'
import * as Toolbar from '~/src/editor/Toolbar'
import * as ClipboardActions from '~/src/editor/actions/Clipboard'
import * as MediaActions from '~/src/editor/actions/Media'

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
  const items: (Toolbar.GroupItem | object)[][] = []

  // Add clipboard actions
  const clipboardItems = []
  for (const item of ClipboardActions.actionGroup.items) {
    clipboardItems.push(item)
  }

  // Add media items
  const mediaItems = []
  mediaItems.push(MediaActions.actionGroup.items.find((item) => item.id === 'media.emoji.request')!)

  items.push(
    clipboardItems,
    mediaItems,
  )
  // Convert items to Nuxt UI dropdown items
  for (const arr of items) {
    for (const i in arr) {
      const item = arr[i]
      arr[i] = getActionContextMenuEntry(item as Toolbar.GroupItem)
    }
  }

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