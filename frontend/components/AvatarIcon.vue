<!-- Displays a rounded avatar icon. -->
<template>
  <div class="avatar placeholder">
    <div class="bg-neutral text-neutral-content w-full rounded-full">
      <img v-if="src" :src="src" />
      <UIcon v-else name="material-symbols:person" /> <!-- Display a generic user icon as fallback. -->
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  src?: string,
}>();

</script>