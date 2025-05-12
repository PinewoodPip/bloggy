<!-- A standard modal component with a header, form content area, and optional footer. -->
<template>
  <div class="large-modal relative">
    <!-- Header -->
    <div class="flex sticky top-0 content-center bg-transparent border-b border-b-neutral/50 z-10 pb-2">
      <slot name="headerTitle"/>

      <HorizontalFill/>
      
      <!-- TODO confirm to close -->
      <button class="btn btn-sm btn-error aspect-square" @click="emit('close')"><UIcon name="i-heroicons-x-mark"/></button>
    </div>

    <!-- Form -->
    <div class="flexcol gap-y-2 flex-grow overflow-y-auto" :class="{ 'py-3': setPadding || (setPadding === undefined) }">
      <slot name="form"/>
    </div>

    <!-- Footer; optional -->
    <div v-if="$slots.footer" class="flex sticky bottom-0 justify-center gap-x-2 bg-white border-t border-t-neutral/50 pt-4">
      <slot name="footer"/>
    </div>
  </div>
</template>

<script setup lang="ts">

const { setPadding = true } = defineProps<{
  /** Whether to automatically add padding to the form area. */
  setPadding?: boolean,
}>();

const emit = defineEmits<{
  close: [],
}>()

</script>