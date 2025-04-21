<!-- Button for displaying and executing toolbar callback and action items. -->
<template>
  <UTooltip>
    <IconButton :icon="item.def.icon" :class="btnClass" class="btn-smp rounded-sm" @pointerdown.prevent @click="useTool" />

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

const btnClass = computed(() => {
  return {
    'btn-secondary': !isActive.value,
    'btn-accent': isActive.value, // Highlight actions currently in use
  }
})

</script>