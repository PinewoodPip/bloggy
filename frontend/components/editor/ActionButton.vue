<!-- Button for displaying and executing editor actions. -->
<template>
  <UTooltip :text="action.def.name">
    <IconButton :icon="action.def.icon" :class="btnClass" class="rounded-sm" @pointerdown.prevent @click="useTool" />
  </UTooltip>
</template>

<script setup lang="ts">
import type { EditorView } from 'prosemirror-view';
import type { EditorState } from 'prosemirror-state';
import type * as Editor from '../../composables/editor/Editor'

const props = defineProps<{
  editor: EditorView,
  state: EditorState,
  action: Editor.IAction,
}>()

const emit = defineEmits<{
  use: [Editor.IAction],
}>()

function useTool() {
  emit('use', props.action)
}

const btnClass = computed(() => {
  const isActive = props.state && props.action.isActive(props.state)
  return {
    'btn-secondary': !isActive,
    'btn-accent': isActive, // Highlight actions currently in use
  }
})

</script>