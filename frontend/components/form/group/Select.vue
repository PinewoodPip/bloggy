<!-- Wrapper element for UFormGroup and USelectMenu. Also applies daisyUI theming. -->
<template>
  <!-- Extra attribute is used for CSS overrides to apply daisyUI theming. Must be at the parent due to how the element is translated to HTML -->
  <UFormGroup data-nuxtui-selectmenu>
    <USelectMenu v-model="model" :options="options" :value-attribute="valueAttribute || 'id'" :leading-icon="icon" />
  </UFormGroup>
</template>

<script setup lang="ts">
import type { ModelRef } from 'vue';

const props = defineProps<{
  icon: string,
  options: object[],
  valueAttribute?: string,
}>()

const model: ModelRef<string> = defineModel({
  default: '',
})

</script>

<style lang="css">

div[data-nuxtui-selectmenu] span {
  @apply !text-base-content
}

</style>