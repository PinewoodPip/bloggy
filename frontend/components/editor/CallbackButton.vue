<!-- Button for displaying and executing toolbar callback items. -->
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

const keybindStringifier = useKeybindStringifier()
const { editor, editorState } = useEditorInjects()

const props = defineProps<{
  item: Toolbar.GroupCallback,
}>()

const emit = defineEmits<{
  use: [Toolbar.GroupItem],
}>()

function useTool() {
  emit('use', props.item)
}

const keybindLabel = computed(() => {
  const keybind = editor.value.getActionKeybind(props.item.id)
  return keybind ? keybindStringifier.stringify(keybind) : null
})

const btnClass = computed(() => {
  const isActive = editorState.value && editor.value.isItemActive(editorState.value, props.item)
  return {
    'btn-secondary': !isActive,
    'btn-accent': isActive, // Highlight actions currently in use
  }
})

</script>