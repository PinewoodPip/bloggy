<!-- Wrapper for UFormGroup and InputField -->
<template>
  <UFormGroup :required="required">
    <InputField v-model="model" :placeholder="placeholder" :icon="icon" />
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