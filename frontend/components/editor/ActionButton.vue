<template>
  <UTooltip :text="action.def.name">
    <IconButton :icon="action.def.icon" class="btn-secondary rounded-sm" @click="useTool" />
  </UTooltip>
</template>

<script setup lang="ts">

const props = defineProps<{
  action: Editor.Action,
}>()

const emit = defineEmits<{
  use: [Editor.Action],
}>()

function useTool() {
  emit('use', props.action)
}

</script>