<template>
  <IconButton :icon="icon" :class="btnClass" class="size-9 text-lg p-0 btn-sm rounded-sm" />
</template>

<script setup lang="ts">

const props = defineProps<{
  icon: icon,
  active: boolean,
}>();

/** The button is highlighted if any action is active. */
const btnClass = computed(() => {
  return {
    'btn-ghost': !props.active,
    'btn-accent': props.active,
  }
})
</script>