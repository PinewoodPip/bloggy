<!-- Button for displaying and executing toolbar callback and action items. -->
<template>
  <UTooltip>
    <ArticleEditorToolbarItemButton :icon="item.def.icon" :active="isActive" :disabled="!isApplicable" @pointerdown.prevent @click="useTool(item)" />

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
import type * as Tools from '~/src/editor/ToolManager'

const { useTool } = useEditorTools()
const { keybindLabel, isActive, isApplicable } = useEditorTool(toRef(() => props.item))

const props = defineProps<{
  item: Tools.CallbackTool,
}>()

</script>

<style lang="css" scoped>

/** Remove the dark background when the button is disabled */
button[disabled] {
  @apply bg-transparent
}

</style>