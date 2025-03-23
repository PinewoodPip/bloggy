<!-- Mark view for links. -->
<template>
  <UTooltip :text="mark.attrs.title">
    <span class="link link-secondary" :ref="contentRef"/>
  </UTooltip>
</template>

<script setup lang="ts">
import { useMarkViewContext } from '@prosemirror-adapter/vue'

const { mark, contentRef } = useMarkViewContext()

</script>