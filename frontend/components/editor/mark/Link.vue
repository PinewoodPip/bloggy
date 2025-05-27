<!-- Mark view for links. -->
<template>
  <UTooltip :text="mark.attrs.title">
    <!-- Links are opened in new tab while in editor -->
    <a class="link link-base-content" :href="mark.attrs.href" :ref="contentRef" :target="!editorView || editorView.editable ? '_blank' : ''" @click="openLink" />
  </UTooltip>
</template>

<script setup lang="ts">
import { useMarkViewContext } from '@prosemirror-adapter/vue'

const { editorView } = useEditorInjects()
const { mark, contentRef } = useMarkViewContext()

/** 
 * Opens the link in a new tab if the editor is editable.
 * Workaround for ProseMirror's default behavior of preventing link clicks while editing.
 */
function openLink(event: MouseEvent) {
  // If the editor is editable, prevent default behavior
  if (editorView.value?.editable) {
    event.preventDefault()
    // Open link in a new tab
    window.open(mark.value.attrs.href, '_blank')
  }
}

</script>