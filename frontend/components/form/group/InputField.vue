<!-- Wrapper for UFormGroup and InputField -->
<template>
  <UFormGroup :required="required">
    <FormInputField v-model="model" :placeholder="placeholder" :icon="icon" :type="type ? type : 'text'" />
  </UFormGroup>
</template>

<script setup lang="ts">
import type { ModelRef } from 'vue';

const props = defineProps<{
  placeholder?: string,
  icon: string,
  required?: boolean,
  type?: string,
}>()

const model: ModelRef<string> = defineModel({
  default: ''
})

</script>