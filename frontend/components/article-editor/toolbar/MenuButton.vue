<!-- Button for displaying and executing subtools from a Menu tool. -->
<template>
  <!-- Tooltip needs to be hidden while the menu is open, as otherwise it would show when hovering over the menu -->
  <UTooltip :text="!menuVisible ? menu.def.name : undefined">
    <UDropdown v-model:open="menuVisible" :items="menuItems" :popper="{ placement: 'bottom-start' }" >
      <ArticleEditorToolbarItemButton :icon="menu.def.icon" :active="isActive || menuVisible"  @click.prevent="toggleMenu" />
    </UDropdown>
  </UTooltip>
</template>

<script setup lang="ts">
import type * as Tools from '~/src/editor/ToolManager'

const { useTool } = useEditorTools()
const { menuItems, isActive } = useToolMenu(() => props.menu, (item) => useTool(item))

const props = defineProps<{
  menu: Tools.MenuTool,
}>()

const menuVisible = ref(false)

function toggleMenu() {
  menuVisible.value = !menuVisible.value
}
</script>