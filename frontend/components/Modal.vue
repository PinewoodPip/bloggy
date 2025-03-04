<!-- A standard modal component with a header, form content area, and optional footer. -->
<template>
  <div class="large-modal">
    <!-- Header -->
    <div class="flex content-center pb-2">
      <slot name="headerTitle"/>

      <HorizontalFill/>
      
      <!-- TODO confirm to close -->
      <button class="btn btn-sm btn-error aspect-square" @click="emit('close')"><UIcon name="i-heroicons-x-mark"/></button>
    </div>

    <!-- Form -->
    <div class="flexcol gap-y-2 py-3">
      <slot name="form"/>
    </div>

    <!-- Footer; optional -->
    <div v-if="$slots.footer" class="flex justify-center gap-x-2 pt-4">
      <slot name="footer"/>
    </div>
  </div>
</template>

<script setup lang="ts">

const emit = defineEmits<{
  close: [],
}>()

</script>