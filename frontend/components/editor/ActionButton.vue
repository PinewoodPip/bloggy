<!-- Button for displaying and executing editor actions. -->
<template>
  <UTooltip>
    <IconButton :icon="action.def.icon" :class="btnClass" class="btn-smp rounded-sm" @pointerdown.prevent @click="useTool" />

    <template #text>
      <span class="flexcol items-center">
        <span>{{ props.action.def.name }}</span>
        <span v-if="keybindLabel">{{ keybindLabel }}</span>
      </span>
    </template>
  </UTooltip>
</template>

<script setup lang="ts">
import type * as Editor from '~/src/editor/Editor'

const keybindStringifier = useKeybindStringifier()
const { editor, editorState } = useEditorInjects()

const props = defineProps<{
  action: Editor.IAction,
}>()

const emit = defineEmits<{
  use: [Editor.IAction],
}>()

function useTool() {
  emit('use', props.action)
}

const keybindLabel = computed(() => {
  const keybind = editor.value.getActionKeybind(props.action.def.id)
  return keybind ? keybindStringifier.stringify(keybind) : null
})

const btnClass = computed(() => {
  const isActive = editorState.value && props.action.isActive(editorState.value)
  return {
    'btn-secondary': !isActive,
    'btn-accent': isActive, // Highlight actions currently in use
  }
})

</script>