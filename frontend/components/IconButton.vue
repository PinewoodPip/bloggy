<!-- A button with an UIcon prefix. -->
<template>
    <button class="btn btn-sm" :class="btnClass"><UIcon :name="icon" /> <slot/></button>
</template>

<script setup lang="ts">

const props = defineProps<{
  "icon": string,
  overrideHeight?: boolean,
}>()

const btnClass = computed(() => {
  return {'icon-button': !props.overrideHeight}
})

</script>

<style lang="css">

.icon-button {
  height: 2.5rem !important;
}

</style>