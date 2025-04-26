<!-- A standard modal component with a header, form content area, and optional footer. -->
<template>
  <div class="large-modal relative">
    <!-- Header -->
    <div class="flex sticky top-0 content-center bg-white border-b border-b-neutral/50 z-10 pb-2">
      <slot name="headerTitle"/>

      <HorizontalFill/>
      
      <!-- TODO confirm to close -->
      <button class="btn btn-sm btn-error aspect-square" @click="emit('close')"><UIcon name="i-heroicons-x-mark"/></button>
    </div>

    <!-- Form -->
    <div class="flexcol flex-grow overflow-y-scroll gap-y-2 py-3">
      <slot name="form"/>
    </div>

    <!-- Footer; optional -->
    <div v-if="$slots.footer" class="flex sticky bottom-0 justify-center gap-x-2 bg-white border-t border-t-neutral/50 pt-4">
      <slot name="footer"/>
    </div>
  </div>
</template>

<script setup lang="ts">

const emit = defineEmits<{
  close: [],
}>()

</script>