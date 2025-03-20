<!-- Button for displaying and executing editor actions. -->
<template>
  <!-- Tooltip needs to be hidden while the menu is open, as otherwise it would show when hovering over the menu -->
  <UTooltip :text="!menuVisible ? menu.name : undefined">
    <UDropdown v-model:open="menuVisible" :items="menuItems" :popper="{ placement: 'bottom-start' }" >
      <IconButton :icon="menu.icon" :class="btnClass" class="btn-smp rounded-sm"  @click.prevent="toggleMenu" />
    </UDropdown>
  </UTooltip>
</template>

<script setup lang="ts">
import type * as Editor from '~/src/editor/Editor'

const { editor, editorState } = useEditorInjects()

const props = defineProps<{
  menu: Editor.ToolbarGroupActionMenu,
}>()

const emit = defineEmits<{
  useAction: [Editor.IAction],
}>()

const menuVisible = ref(false)

function toggleMenu() {
  menuVisible.value = !menuVisible.value
}

/** NuxtUI dropdown menu items. */
const menuItems = computed(() => {
  const items = []
  for (const actionID of props.menu.actionIDs) {
    if (editor.value.isActionVisibleInToolbar(actionID)) {
      const action = editor.value.getAction(actionID)
      items.push({
        label: action.def.name,
        icon: action.def.icon,
        click: () => {
          emit('useAction', action)
        }
      })
    }
  }
  return [items]
})

/** The button is highlighted if any action is active. */
const btnClass = computed(() => {
  const isActive = editorState.value && props.menu.actionIDs.find((actionID) => {
    return editor.value.getAction(actionID).isActive(editorState.value)
  })
  return {
    'btn-secondary': !isActive,
    'btn-accent': isActive,
  }
})

</script>