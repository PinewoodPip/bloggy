<!-- Modal for inserting images from links. -->
<template>
  <FullscreenModal v-model="openModel" :can-confirm="canConfirm" :confirm-callback="confirm">
    <template #headerTitle>
      {{ isEditing ? 'Edit image' : 'Insert image from link' }}
    </template>
    <template #form>
      <FormGroupInputField v-model="image.src" label="URL" icon="material-symbols:link" :required="true" />
      <FormGroupInputField v-model="image.alt" label="Alt" help="Description shown in tooltip and to assistive technologies." icon="material-symbols:title" />
      <FormGroupInputField v-model="image.maxHeight" type="number" min="-1" label="Max Height" help="Maximum height in pixels." icon="material-symbols:fit-page-height" />
    </template>
    <template #footer>
      <IconButton class="btn-primary" icon="material-symbols:add-link" :disabled="!canConfirm" @click="confirm">Confirm</IconButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import type { Reactive } from 'vue';
import type { ImageAttrs } from '~/src/editor/Editor';

const emit = defineEmits<{
  confirm: [ImageAttrs],
}>()

const image: Reactive<ImageAttrs> = reactive({
  src: '',
  alt: '',
  maxHeight: -1,
})
const isEditing = ref(false)

const openModel = defineModel('open', {
  default: false,
})

/** Opens the modal. Attrs may be provided to edit an existing image's attrs. */
function open(attrs?: ImageAttrs) {
  // Reset values
  image.src = ''
  image.alt = ''
  isEditing.value = attrs !== undefined

  // Copy attrs
  if (attrs) {
    for (const key in attrs) {
      // @ts-ignore
      image[key] = attrs[key]
    }
  }

  openModel.value = true
}
defineExpose({
  open,
})

const canConfirm = computed(() => {
  return image.src !== ''
})

function confirm() {
  openModel.value = false
  emit('confirm', image)
}

</script>