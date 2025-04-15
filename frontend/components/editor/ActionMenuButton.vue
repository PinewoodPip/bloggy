<!-- Button for displaying and executing editor actions. -->
<template>
  <!-- Tooltip needs to be hidden while the menu is open, as otherwise it would show when hovering over the menu -->
  <UTooltip :text="!menuVisible ? menu.def.name : undefined">
    <UDropdown v-model:open="menuVisible" :items="menuItems" :popper="{ placement: 'bottom-start' }" >
      <IconButton :icon="menu.def.icon" :class="btnClass" class="btn-smp rounded-sm"  @click.prevent="toggleMenu" />
    </UDropdown>
  </UTooltip>
</template>

<script setup lang="ts">
import type * as Editor from '~/src/editor/Editor'
import type * as Toolbar from '~/src/editor/Toolbar'

const { editor, editorState, toolbar } = useEditorInjects()

const props = defineProps<{
  menu: Toolbar.GroupActionMenu,
}>()

const emit = defineEmits<{
  useAction: [Toolbar.GroupItem],
}>()

const menuVisible = ref(false)

function toggleMenu() {
  menuVisible.value = !menuVisible.value
}

/** NuxtUI dropdown menu items. */
const menuItems = computed(() => {
  const items = []
  for (const subitem of props.menu.subitems) {
    if (toolbar.value.isItemVisible(subitem.id)) {
      items.push({
        label: subitem.def.name,
        icon: subitem.def.icon,
        click: () => {
          emit('useAction', subitem)
        }
      })
    }
  }
  return [items]
})

/** The button is highlighted if any action is active. */
const btnClass = computed(() => {
  const isActive = editorState.value && props.menu.subitems.find((subitem) => {
    return editor.value.isItemActive(editorState.value, subitem)
  })
  return {
    'btn-secondary': !isActive,
    'btn-accent': isActive,
  }
})

</script>