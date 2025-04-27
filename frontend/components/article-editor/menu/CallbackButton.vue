<!-- Button for displaying and executing toolbar callback and action items. -->
<template>
  <UTooltip>
    <ArticleEditorMenuItemButton :icon="item.def.icon" :active="isActive" @pointerdown.prevent @click="useTool" />

    <!-- Tooltip template -->
    <template #text>
      <span class="flexcol items-center">
        <span>{{ props.item.def.name }}</span>
        <span v-if="keybindLabel">{{ keybindLabel }}</span>
      </span>
    </template>
  </UTooltip>
</template>

<script setup lang="ts">
import type * as Toolbar from '~/src/editor/Toolbar'

const { useItem } = useEditorToolbar()
const { keybindLabel, isActive } = useToolbarCallbackItem(toRef(() => props.item))

const props = defineProps<{
  item: Toolbar.GroupCallback,
}>()

function useTool() {
  useItem(props.item)
}

</script>