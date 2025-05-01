<template>
  <Dropdown :items="dropdownItems">
    <button class="btn btn-sm text-base-content" :label="item.def.name" @click="useTool(item)">
      {{ item.def.name }}
    </button>
  </Dropdown>
</template>

<script setup lang="ts">
import type * as Tools from '~/src/editor/ToolManager'

const { useTool } = useEditorTools()

const props = defineProps<{
  item: Tools.Tool,
}>();

const dropdownItems = computed(() => {
  if (props.item.type === 'menu') {
    // Map to Nuxt UI items
    return [(props.item as Tools.MenuTool).subitems.map((item) => ({
      label: item.def.name,
      icon: item.def.icon,
      click: () => useTool(item),
    }))];
  }
  return []; // Don't show dropdown
});

</script>