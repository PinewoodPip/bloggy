<!-- Emoji selector widget. -->
<template>
  <UContextMenu v-model="isOpen" :virtual-element="virtualElement" tabindex="0" @keydown.esc="isOpen = false">
    <div class="p-4">
      <Picker class="max-w-md max-h-128" :data="emojiIndex" :darkMode="true" set="twitter" @select="onEmojiSelected" title="Emoji Picker" />
    </div>
  </UContextMenu>
</template>

<script setup lang="ts">
import { useMouse, useWindowScroll } from '@vueuse/core'
import data from "emoji-mart-vue-fast/data/twitter.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";
const emojiIndex = new EmojiIndex(data);

const { x, y } = useMouse()
const { y: windowY } = useWindowScroll()
const virtualElement = ref({ getBoundingClientRect: () => ({}) })

const emit = defineEmits<{
  confirm: [object],
}>();

const isOpen = ref(false)

function open() {
  isOpen.value = true
}

defineExpose({
  open,
})

function onEmojiSelected(emoji: any) {
  emit('confirm', emoji)
  isOpen.value = false
}

// Position the widget when it is opened
watch(isOpen, () => {
  if (!isOpen) return; // Do nothing if the menu is being closed
  const top = unref(y) - unref(windowY)
  const left = unref(x)

  virtualElement.value.getBoundingClientRect = () => ({
    width: 0,
    height: 0,
    top,
    left
  })
})

// Escape shortcut to close
defineShortcuts({
  escape: {
    usingInput: true,
    whenever: [isOpen],
    handler: () => {
      isOpen.value = false
    },
  }
})

</script>

<style lang="css">

/* Restyle elements to fit daisyui theme */
.emoji-mart {
  background: none !important;
  @apply border-none
}

.emoji-mart-search > input {
  background: none;
  @apply text-neutral-content border-neutral-content/50 my-2
}

.emoji-mart-category-label > h3 {
  background: none;
  @apply text-neutral-content
}

.emoji-mart-emoji:hover:before {
  @apply !bg-neutral-content/40
}

.emoji-mart-title-label {
  @apply text-neutral-content
}

.emoji-mart-preview-data > div {
  @apply text-neutral-content
}

</style>