<!-- Setting entry for an action; allows changing its keybind and visibility. -->
<template>
  <div class="flex items-center">
    <UIcon class="size-5 mr-3" :class="nameClass" :name="action.def.icon"/>
    <span :class="nameClass">{{ action.def.name }}</span>
    <span v-if="!isVisibleInToolbar" class="italic ml-1" :class="nameClass">(hidden)</span>

    <HorizontalFill/>

    <!-- Right side -->
    <div class="flex gap-x-2">
      <!-- Reset keybind button -->
      <UTooltip v-if="canReset" text="Reset keybind to default">
        <button class="flex items-center" @click="resetToDefault">
          <UIcon class="text-error" name="i-heroicons-arrow-path-rounded-square"/>
        </button>
      </UTooltip>

      <!-- Rebind button -->
      <button class="btn btn-sm btn-secondary" @click="rebind">
        <UKbd v-if="props.keybind">{{ keybindStr }}</UKbd>
        <span v-else>Unbound</span>
      </button>

      <UTooltip :text="visibilityTooltip">
        <IconButton class="btn-sm btn-secondary" :icon="isVisibleInToolbar ? 'i-material-symbols-visibility' : 'i-material-symbols-visibility-off'" @click="toggleVisibility" />
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Editor from '../../../composables/editor/Editor'

const keybindStringifier = useKeybindStringifier()

const props = defineProps<{
  action: Editor.IAction,
  isVisibleInToolbar: boolean,
  canReset?: boolean,
  keybind: Editor.keybind | null,
}>()

const emit = defineEmits<{
  rebind: [Editor.actionID],
  toggleVisibility: [Editor.actionID, boolean]
  resetToDefault: [Editor.actionID]
}>()

function rebind() {
  emit('rebind', props.action.def.id)
}

function toggleVisibility() {
  emit('toggleVisibility', props.action.def.id, !props.isVisibleInToolbar)
}

function resetToDefault() {
  emit('resetToDefault', props.action.def.id)
}

const keybindStr = computed(() => {
  return props.keybind ? keybindStringifier.stringify(props.keybind) : null
})

const nameClass = computed(() => {
  return {
    'text-base-content/70': !props.isVisibleInToolbar, // 70% opacity is just enough for contrast requirements
  }
})

const visibilityTooltip = computed(() => {
  return props.isVisibleInToolbar ? 'Shown in toolbar' : 'Not shown in toolbar'
})

</script>