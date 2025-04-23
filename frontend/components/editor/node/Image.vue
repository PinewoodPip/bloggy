<!-- Image node view. -->
<template>
  <UTooltip :text="node.attrs.alt">
    <img :src="node.attrs.src" :alt="node.attrs.alt" />
  </UTooltip>
</template>

<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'
import type { NodeCallbacks } from '~/components/article-editor/ArticleEditor.vue'

const { contentRef, node } = useNodeViewContext()
const nodeCallbacks = inject<NodeCallbacks>('nodeCallbacks')

</script>