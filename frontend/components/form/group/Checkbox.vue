<!-- Wrapper for UFormGroup and UCheckbox. -->
<template>
  <UFormGroup>
    <div class="form-control">
      <label class="label justify-start cursor-pointer rounded-md bg-base-300 pl-2 gap-x-2">
        <input type="checkbox" v-model="model" class="checkbox checkbox-neutral checkbox-sm" />
        <span class="flex flex-grow gap-x-2 items-center label-text pr-1">
          <UIcon class="size-6" :name="props.icon" />
          {{ props.label }}
        </span>
      </label>
    </div>
  </UFormGroup>
</template>

<script setup lang="ts">
import type { ModelRef } from 'vue';

const props = defineProps<{
  icon: string,
  label: string,
}>()

const model: ModelRef<boolean> = defineModel({
  default: false
})
</script>