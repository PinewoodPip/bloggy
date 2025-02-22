<!-- A button with an UIcon prefix. -->
<template>
    <button class="icon-button btn btn-sm"><UIcon :name="icon" /> <slot/></button>
</template>

<script setup lang="ts">

const props = defineProps<{
  "icon": string,
}>()

</script>

<style lang="css">

.icon-button {
  height: 2.5rem !important;
}

</style>