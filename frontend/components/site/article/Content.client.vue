<!-- Wrapper around ProsemirrorAdapterProvider and a readonly Document that only renders client-side. -->
<template>
  <ProsemirrorAdapterProvider>
    <EditorProseMirrorWrapper :schema="schema" :initial-content="initialContent" :readonly="true" />
  </ProsemirrorAdapterProvider>
</template>

<script setup lang="ts">
import { Schema } from 'prosemirror-model'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'

const props = defineProps<{
  schema: Schema,
  initialContent: string,
}>()

</script>