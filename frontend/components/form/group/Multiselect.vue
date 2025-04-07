<!-- Wrapper for UFormGroup and vue-multiselect. -->
<template>
  <UFormGroup>
    <VueMultiselect v-model="model" :options="options" :searchable="searchable" :multiple="multiple" :close-on-select="!multiple" :show-labels="showLabels" :track-by="trackBy" :label="optionLabelKey" :placeholder="placeholder" :aria-label="ariaLabel" :disabled="disabled" @search-change="onSearchChange" />
  </UFormGroup>
</template>

<script setup lang="ts">
import { Multiselect as VueMultiselect } from 'vue-multiselect'
import type { ModelRef } from 'vue';

const emit = defineEmits<{
  searchChange: [string],
}>();

const props = defineProps<{
  options: object[],
  trackBy: string,
  optionLabelKey: string,
  showLabels?: boolean,
  searchable?: boolean,
  multiple?: boolean,
  placeholder?: string,
  ariaLabel?: string,
  disabled?: boolean,
}>()

/** Should be a single item for single-select or array for multi-select. */
const model: ModelRef<any | any[]> = defineModel()

function onSearchChange(query: string) {
  emit('searchChange', query)
}

</script>