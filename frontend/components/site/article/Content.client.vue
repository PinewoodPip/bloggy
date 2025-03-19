<!-- Wrapper around ProsemirrorAdapterProvider and a readonly Document that only renders client-side. -->
<template>
  <ProsemirrorAdapterProvider>
    <EditorDocument :initial-content="initialContent" :readonly="true" />
  </ProsemirrorAdapterProvider>
</template>

<script setup lang="ts">
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'

const props = defineProps<{
  initialContent: string,
}>()

</script>