<!-- Hash node decoration. -->
<template>
  <span class="hash">{{ hashes }}</span>
</template>

<script setup lang="ts">
import { useWidgetViewContext } from '@prosemirror-adapter/vue'

const { spec } = useWidgetViewContext()
const level = spec?.level
const hashes = Array(level || 0).fill('#').join('')

</script>

<style scoped>
.hash {
  color: blue;
  margin-right: 6px;
}
</style>