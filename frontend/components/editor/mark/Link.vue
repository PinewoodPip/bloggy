<!-- Mark view for links. -->
<template>
  <span class="link link-secondary" :ref="contentRef"/>
</template>

<script setup lang="ts">
import { useMarkViewContext } from '@prosemirror-adapter/vue'

const { mark, contentRef } = useMarkViewContext()

</script>