<!-- Text paragraph node view. -->
<template>
  <div :ref="contentRef" role="presentation" :class="{ selected }" />
</template>

<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'

const { contentRef, selected } = useNodeViewContext()
</script>

<style scoped>
.selected {
    outline: blue solid 1px;
}
</style>