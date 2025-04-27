<template>
  <Dropdown :items="dropdownItems">
    <button class="btn btn-sm text-base-content" :label="item.def.name" @click="useItem(item)">
      {{ item.def.name }}
    </button>
  </Dropdown>
</template>

<script setup lang="ts">
import type * as Toolbar from '~/src/editor/Toolbar'

const { useItem } = useEditorToolbar()

const props = defineProps<{
  item: Toolbar.GroupItem,
}>();

const dropdownItems = computed(() => {
  if (props.item.type === 'actionMenu') {
    // Map to Nuxt UI items
    return [(props.item as Toolbar.GroupActionMenu).subitems.map((item) => ({
      label: item.def.name,
      icon: item.def.icon,
      click: () => useItem(item),
    }))];
  }
  return []; // Don't show dropdown
});

</script>