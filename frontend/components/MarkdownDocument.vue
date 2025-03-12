<template>
  <div ref="editorRef" class="editor">
    <div class="ProseMirror ProseMirror-example-setup-style" v-html="markdownHTML" />
  </div>
</template>

<script setup lang="ts">
import { Markdown } from '~/src/editor/markdown/Parser'

const props = defineProps<{
  content: string,
}>()

const markdownHTML: Ref<string | null> = ref(null)

/** Render HTML from the markdown document */
watchEffect((onCleanup) => {
  const result = Markdown.render(props.content)
  markdownHTML.value = result
})

</script>
