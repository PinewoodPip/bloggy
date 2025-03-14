<!-- A button with an UIcon prefix. -->
<template>
  <button class="btn"><UIcon :name="icon" /> <slot/></button>
</template>

<script setup lang="ts">

const props = defineProps<{
  icon: string,
}>()

</script>