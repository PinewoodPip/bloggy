<!-- A button with an UIcon prefix. -->
<template>
    <button class="sidebar-button"><UIcon :name="icon" /> <slot/></button>
</template>

<script setup lang="ts">

const props = defineProps<{
  "icon": string,
}>()

</script>

<style lang="css">

.sidebar-button {
  @apply btn btn-sm
}

</style>