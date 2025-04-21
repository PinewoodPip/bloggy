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
import type * as Toolbar from '~/src/editor/Toolbar'

const { menuItems, isActive } = useToolbarActionMenu(() => props.menu, (item) => emit('useAction', item))

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

/** The button is highlighted if any action is active. */
const btnClass = computed(() => {
  return {
    'btn-secondary': !isActive.value,
    'btn-accent': isActive.value,
  }
})

</script>