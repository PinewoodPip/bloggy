<!-- Image node view. -->
<template>
  <UTooltip :text="node.attrs.alt">
    <img :src="node.attrs.src" :alt="node.attrs.alt" @click="onClick" />
  </UTooltip>
</template>

<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'

const { contentRef, node } = useNodeViewContext()
const emitter = useGlobalEvents()

/** Notify the editor when the image is selected. */
function onClick() {
  emitter.emit('editor.imageSelected', node.value)
}

</script>