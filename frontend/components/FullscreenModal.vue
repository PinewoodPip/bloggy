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

const props = defineProps<{
  /** Whether the modal admits ctrl+enter as a confirm shortcut. If true, confirmCallback should also be set. */
  canConfirm?: boolean,
  /** Callback for closing the modal via the confirm shortcut. */
  confirmCallback?: () => void,
}>()

const model: ModelRef<boolean> = defineModel({
  default: false,
})

const canConfirm = computed(() => {
  return props.canConfirm ? props.canConfirm : false
})

// Ctrl+enter shortcut to "confirm"
defineShortcuts({
  ctrl_enter: {
    usingInput: true,
    whenever: [canConfirm, model], // Model requirement ensures the hotkey only runs when the modal is open
    handler: () => {
      props.confirmCallback!()
    },
  }
})

</script>