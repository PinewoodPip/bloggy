<!-- UIcon wrapper that can automatically prefix icon IDs to a default icon set. -->
<template>
  <UIcon :name="iconID" />
</template>

<script setup lang="ts">

const props = defineProps<{
  /** Icon set to use. Defaults to material-symbols. */
  source?: string,
  /** The icon ID. If source is provided, the i-{icon set}- prefix may be dropped. */
  icon: string,
}>()

const iconID = computed(() => {
  // Do not prefix the icon if it already follows the UIcon format
  if (props.icon.startsWith("i-")) {
    return props.icon
  } else {
    // Prefix with source
    return `i-${(props.source ? props.source : 'material-symbols')}-${props.icon}`
  }
})

</script>