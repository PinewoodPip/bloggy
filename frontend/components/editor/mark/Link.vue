<!-- Mark view for links. -->
<template>
  <UTooltip :text="mark.attrs.title">
    <!-- Links are only clickable when the editor is in read-only mode -->
    <a class="link link-secondary" :href="!editorView || !editorView.editable ? mark.attrs.href : '#'" :ref="contentRef"/>
  </UTooltip>
</template>

<script setup lang="ts">
import { useMarkViewContext } from '@prosemirror-adapter/vue'

const { editorView } = useEditorInjects()
const { mark, contentRef } = useMarkViewContext()

</script>