<!-- Status bar, showing various document stats. -->
<template>
  <div class="flex bg-base-200 border-t border-t-base-300 py-2">
    <div class="flex gap-x-3 mx-auto flex-grow justify-end px-8 max-w-6xl">
      <!-- Word count -->
      <p class="status-label">{{ wordCount }} Words</p>
      <UTooltip :text="`Assuming the average ${AVERAGE_WORDS_PER_MINUTE} WPM reading speed.` ">
        <p class="status-label">{{ readingTimeLabel }} Reading time</p>
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import formatTime from 'format-duration'

const { editorState: state } = useEditorInjects()

/** Average human WPM reading speed. */
const AVERAGE_WORDS_PER_MINUTE = 238

const wordCount = computed(() => {
  return (state.value && state.value.doc) ? ProseMirrorUtils.countWords(state.value.doc) : 0
})

const readingTimeLabel = computed(() => {
  return formatTime(readingTime.value * 1000)
})

/** Estimated text reading time in seconds. */
const readingTime = computed(() => {
  const words = wordCount.value
  const seconds = words / (AVERAGE_WORDS_PER_MINUTE / 60)
  return seconds
})

</script>

<style lang="css" scoped>

.status-label {
  @apply text-sm text-base-content/80 w-fit
}

</style>