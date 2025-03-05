<!-- Wrapper for UFormGroup and InputField -->
<template>
  <UFormGroup>
    <InputField v-model="model" :placeholder="placeholder" :icon="icon" :required="required" />
  </UFormGroup>
</template>

<script setup lang="ts">
import type { ModelRef } from 'vue';

const props = defineProps<{
  placeholder?: string,
  icon: string,
  required?: boolean,
}>()

const model: ModelRef<string> = defineModel({
  default: ''
})

</script>