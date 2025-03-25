<!-- Modal for inserting images from links. -->
<template>
  <FullscreenModal v-model="open" :can-confirm="canConfirm" :confirm-callback="confirm">
    <template #headerTitle>
      Insert image from link
    </template>
    <template #form>
      <FormGroupInputField v-model="image.src" label="URL" icon="material-symbols:link" :required="true" />
      <FormGroupInputField v-model="image.alt" label="Alt" help="Description shown in tooltip and to assitive technologies." icon="material-symbols:title" />
    </template>
    <template #footer>
      <IconButton class="btn-primary" icon="material-symbols:add-link" :disabled="!canConfirm" @click="confirm">Confirm</IconButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">

const emit = defineEmits<{
  confirm: [],
}>()

const image = defineModel('image', {
  default: {
    src: '',
    alt: '',
  },
})

const open = defineModel('open', {
  default: false,
})

const canConfirm = computed(() => {
  return image.value.src !== ''
})

function confirm() {
  open.value = false
  emit('confirm')
}

</script>