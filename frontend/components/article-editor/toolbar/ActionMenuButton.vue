<!-- Button for displaying and executing editor actions. -->
<template>
  <!-- Tooltip needs to be hidden while the menu is open, as otherwise it would show when hovering over the menu -->
  <UTooltip :text="!menuVisible ? menu.def.name : undefined">
    <UDropdown v-model:open="menuVisible" :items="menuItems" :popper="{ placement: 'bottom-start' }" >
      <ArticleEditorToolbarItemButton :icon="menu.def.icon" :active="isActive || menuVisible"  @click.prevent="toggleMenu" />
    </UDropdown>
  </UTooltip>
</template>

<script setup lang="ts">
import type * as Toolbar from '~/src/editor/Toolbar'

const { useItem } = useEditorToolbar()
const { menuItems, isActive } = useToolbarActionMenu(() => props.menu, (item) => useItem(item))

const props = defineProps<{
  menu: Toolbar.GroupActionMenu,
}>()

const menuVisible = ref(false)

function toggleMenu() {
  menuVisible.value = !menuVisible.value
}

</script>