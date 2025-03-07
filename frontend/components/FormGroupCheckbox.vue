<!-- Wrapper for UFormGroup and UCheckbox. -->
<template>
  <UFormGroup>
    <UCheckbox v-model="model" :icon="icon" />
  </UFormGroup>
</template>

<script setup lang="ts">
import type { ModelRef } from 'vue';

const props = defineProps<{
  icon: string,
}>()

const model: ModelRef<boolean> = defineModel({
  default: false
})
</script>