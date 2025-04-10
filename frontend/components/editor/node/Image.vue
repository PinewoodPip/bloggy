<!-- Image node view. -->
<template>
  <UTooltip :text="node.attrs.alt">
    <img :src="node.attrs.src" :alt="node.attrs.alt" @click="onClick" />
  </UTooltip>
</template>

<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'
import type { NodeCallbacks } from '~/pages/admin/editor.client.vue'

const { contentRef, node } = useNodeViewContext()
const nodeCallbacks = inject<NodeCallbacks>('nodeCallbacks')

/** Notify the editor when the image is selected. */
function onClick() {
  nodeCallbacks?.selectNode(node.value)
}

</script>