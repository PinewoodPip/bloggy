<!-- Heading node view. -->
<template>
  <component :is="tag" :ref="contentRef" />
</template>

<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'
import { computed } from 'vue'

const { contentRef, node } = useNodeViewContext()

const tag = computed(() => {
  return `h${node.value.attrs.level}`
})
</script>