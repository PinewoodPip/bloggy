<!-- Footnote node view. Editing the node is delegated to editor, due to contenteditable shenanigans not allowing an inline editor. -->
<template>
  <UTooltip :text="node.attrs.text">
    <sup class="cursor-help" :ref="contentRef" @click="onClick">
      [{{ node.attrs.index }}]
    </sup>
  </UTooltip>
</template>

<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'

const { contentRef, selected, node } = useNodeViewContext()
const emitter = useGlobalEvents()

function onClick() {
  emitter.emit('editor.footnoteSelected', node.value)
}

</script>

<style scoped>
.selected {
    outline: blue solid 1px;
}
</style>