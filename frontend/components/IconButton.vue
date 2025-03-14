<!-- A button with an UIcon prefix. -->
<template>
  <button class="btn">
    <Icon :source="iconSource" :icon="icon" />
    <slot/>
  </button>
</template>

<script setup lang="ts">

const props = defineProps<{
  iconSource?: string,
  icon: string,
}>()

</script>