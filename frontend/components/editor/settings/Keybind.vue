<!-- Setting entry for an action's keybind. -->
<template>
  <div class="flex items-center">
    <UIcon class="size-5 mr-3" :name="action.def.icon"/>
    <span>{{ action.def.name }}</span>

    <HorizontalFill/>

    <button class="btn btn-sm btn-neutral" @click="rebind">
      <UKbd v-if="props.keybind">{{ keybindStr }}</UKbd>
      <span v-else>Unbound</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import * as Editor from '../../../composables/editor/Editor'

const keybindStringifier = useKeybindStringifier()

const props = defineProps<{
  action: Editor.IAction,
  keybind: Editor.keyCombo | null,
}>()

const emit = defineEmits<{
  rebind: [string],
}>()

function rebind() {
  emit('rebind', props.action.def.id)
}

const keybindStr = computed(() => {
  return props.keybind ? keybindStringifier.stringify(props.keybind) : null
})

</script>