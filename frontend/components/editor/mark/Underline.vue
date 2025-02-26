<!-- A mark for underlined text. -->
<template>
  <!-- Wrap content in underlined span -->
  <span class="underline" :ref="contentRef"/>
</template>

<script setup lang="ts">
import { useMarkViewContext } from '@prosemirror-adapter/vue'

const { mark, contentRef } = useMarkViewContext()

</script>