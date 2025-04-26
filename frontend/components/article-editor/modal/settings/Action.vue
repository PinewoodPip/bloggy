<!-- Setting entry for an action; allows changing its keybind and visibility. -->
<template>
  <div class="flex items-center hover:bg-neutral/20 rounded-md">
    <UIcon class="size-5 mr-2 ml-1" :class="nameClass" :name="item.def.icon"/>
    <span :class="nameClass">{{ itemNameLabel }}</span>
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

      <!-- Visibility button -->
      <UTooltip :text="visibilityTooltip">
        <IconButton class="btn-sm btn-ghost" :icon="isVisibleInToolbar ? 'i-material-symbols-visibility' : 'i-material-symbols-visibility-off'" @click="toggleVisibility" />
      </UTooltip>

      <!-- Rebind button -->
      <UTooltip text="Keybind">
        <button class="btn btn-sm btn-secondary min-w-24" @click="rebind">
          <UKbd v-if="props.keybind">{{ keybindStr }}</UKbd>
          <span v-else>Unbound</span>
        </button>
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Editor from '~/src/editor/Editor'
import * as Toolbar from '~/src/editor/Toolbar'

const keybindStringifier = useKeybindStringifier()

const props = defineProps<{
  item: Toolbar.GroupItem,
  isVisibleInToolbar: boolean,
  canReset?: boolean,
  keybind: Editor.keybind | null,
}>()

const emit = defineEmits<{
  rebind: [Toolbar.GroupItem],
  toggleVisibility: [Toolbar.GroupItem, boolean]
  resetToDefault: [Toolbar.GroupItem]
}>()

function rebind() {
  emit('rebind', props.item)
}

function toggleVisibility() {
  emit('toggleVisibility', props.item, !props.isVisibleInToolbar)
}

function resetToDefault() {
  emit('resetToDefault', props.item)
}

const keybindStr = computed(() => {
  return props.keybind ? keybindStringifier.stringify(props.keybind) : null
})

const itemNameLabel = computed(() => {
  const def = props.item.def;
  return def.longName || def.name // Prefer longer names as items from submenus tend to rely on parent item for context, which is not visible in the settings menu
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