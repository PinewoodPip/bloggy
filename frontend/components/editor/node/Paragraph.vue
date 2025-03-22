<!-- Text paragraph node view. -->
<template>
  <div :ref="contentRef" role="presentation" :class="{ selected, ...classes}" class="break-words" />
</template>

<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'

const { contentRef, node, selected } = useNodeViewContext()

const classes = computed(() => {
  // Apply text alignment
  // Done in a lame way to have Tailwind CSS detect the classes being used (else they could be omitted in a build)
  const alignmentToClass = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
    justify: 'text-justify',
  }
  return {
    // @ts-ignore
    [alignmentToClass[node.value.attrs.align]]: true,
  }
})

</script>

<style scoped>
.selected {
  outline: blue solid 1px;
}
</style>