<template>
  <UModal v-model="model" :overlay="true">
    <Modal @close="model = false">
      <template #headerTitle>
        <slot name="headerTitle" />
      </template>
      <template #form>
        <slot name="form" />
      </template>
      <template #footer>
        <slot name="footer" />
      </template>
    </Modal>
  </UModal>
</template>

<script setup lang="ts">
import type { ModelRef } from 'vue';

const model: ModelRef<boolean> = defineModel({
  default: false,
})

</script>