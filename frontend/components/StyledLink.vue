<!-- Wrapper for RouterLink that adds standard link styling. -->
<template>
  <RouterLink :to="to" class="underline">
    <slot />
  </RouterLink>
</template>

<script setup lang="ts">

const props = defineProps<{
  to: string,
}>()

</script>