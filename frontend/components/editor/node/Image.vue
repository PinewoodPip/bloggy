<!-- Image node view. -->
<template>
  <UTooltip :text="node.attrs.alt">
    <img :style="style" :src="node.attrs.src" :alt="node.attrs.alt" @dblclick="selectNode" />
  </UTooltip>
</template>

<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'
import type { NodeCallbacks } from '~/components/article-editor/ArticleEditor.vue'

const { contentRef, node } = useNodeViewContext()
const nodeCallbacks = inject<NodeCallbacks>('nodeCallbacks')

function selectNode() {
  nodeCallbacks?.selectNode(node.value)
}

/** Set max height based on node attrs. */
const style = computed(() => {
  const { maxHeight } = node.value.attrs
  return {
    'max-height': `${maxHeight}px`,
  }
})

</script>