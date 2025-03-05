<!-- Setting entry for an action's keybind. -->
<template>
  <div class="flex items-center">
    <UIcon class="size-5 mr-3" :name="action.def.icon"/>
    <span>{{ action.def.name }}</span>

    <HorizontalFill/>

    <!-- Right side -->
    <div class="flex gap-x-2">
      <!-- Reset keybind button -->
      <UTooltip v-if="canReset" text="Reset to default">
        <button class="flex items-center" @click="resetToDefault">
          <UIcon class="text-error" name="i-heroicons-arrow-path-rounded-square"/>
        </button>
      </UTooltip>

      <!-- Rebind button -->
      <button class="btn btn-sm btn-neutral" @click="rebind">
        <UKbd v-if="props.keybind">{{ keybindStr }}</UKbd>
        <span v-else>Unbound</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Editor from '../../../composables/editor/Editor'

const keybindStringifier = useKeybindStringifier()

const props = defineProps<{
  action: Editor.IAction,
  canReset?: boolean,
  keybind: Editor.keybind | null,
}>()

const emit = defineEmits<{
  rebind: [Editor.actionID],
  resetToDefault: [Editor.actionID]
}>()

function rebind() {
  emit('rebind', props.action.def.id)
}

function resetToDefault() {
  emit('resetToDefault', props.action.def.id)
}

const keybindStr = computed(() => {
  return props.keybind ? keybindStringifier.stringify(props.keybind) : null
})

</script>