<!-- Button for displaying and executing editor actions. -->
<template>
  <UTooltip>
    <IconButton :icon="action.def.icon" :class="btnClass" class="rounded-sm" @pointerdown.prevent @click="useTool" />

    <template #text>
      <span class="flexcol items-center">
        <span>{{ props.action.def.name }}</span>
        <span v-if="keybindLabel">{{ keybindLabel }}</span>
      </span>
    </template>
  </UTooltip>
</template>

<script setup lang="ts">
import type { EditorState } from 'prosemirror-state';
import type * as Editor from '../../composables/editor/Editor'

const keybindStringifier = useKeybindStringifier()

const props = defineProps<{
  editor: Editor.Editor,
  state: EditorState,
  action: Editor.IAction,
}>()

const emit = defineEmits<{
  use: [Editor.IAction],
}>()

function useTool() {
  emit('use', props.action)
}

const keybindLabel = computed(() => {
  const keybind = props.editor.getActionKeybind(props.action.def.id)
  return keybind ? keybindStringifier.stringify(keybind) : null
})

const btnClass = computed(() => {
  const isActive = props.state && props.action.isActive(props.state)
  return {
    'btn-secondary': !isActive,
    'btn-accent': isActive, // Highlight actions currently in use
  }
})

</script>