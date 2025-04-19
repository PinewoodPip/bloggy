<!-- Status bar, showing various document stats. -->
<template>
  <div class="flex bg-base-200 border-t border-t-base-300 py-2">
    <div class="flex gap-x-2 mx-auto flex-grow justify-end px-8 max-w-6xl">
      <!-- Word count -->
      <p class="text-sm text-base-content/80 w-fit">{{ wordCount }} Words</p>
    </div>
  </div>
</template>

<script setup lang="ts">

const { editorState: state } = useEditorInjects()

const wordCount = computed(() => {
  return (state.value && state.value.doc) ? ProseMirrorUtils.countWords(state.value.doc) : 0
})

</script>