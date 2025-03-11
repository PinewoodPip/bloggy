<!-- Dummy element to import JSDOM only in SSR. -->
<template>
  <div class=""/>
</template>

<script setup lang="ts">
import { applyJSDOM } from '~/src/JSDOM'

applyJSDOM()

</script>