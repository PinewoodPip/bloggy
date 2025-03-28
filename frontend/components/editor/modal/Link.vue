<!-- Modal for editing link properties. -->
<template>
  <FullscreenModal v-model="isOpen" :can-confirm="true" :confirm-callback="confirm">
    <template #headerTitle>
      Edit link
    </template>
    <template #form>
      <FormGroupInputField v-model="link.href" label="URL" icon="material-symbols:link" :required="true" />
      <FormGroupInputField v-model="link.title" label="Title" help="Shown as a tooltip." icon="material-symbols:title" />
    </template>
    <template #footer>
      <IconButton class="btn-primary" icon="material-symbols:add-link" @click="confirm">Confirm</IconButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import type { LinkAttrs } from '~/src/editor/Editor';

const emit = defineEmits<{
  confirm: [LinkAttrs],
}>()

const link = defineModel<LinkAttrs>('link', {
  default: {
    title: '',
    href: '',
  },
})

const isOpen = ref(false)

function open(attrs?: LinkAttrs) {
  // Reset form
  link.value.href = ''
  link.value.title = ''

  // Copy attrs
  if (attrs) {
    for (const key in attrs) {
      // @ts-ignore
      link.value[key] = attrs[key]
    }
  }

  isOpen.value = true
}
defineExpose({
  open,
})

function confirm() {
  isOpen.value = false
  emit('confirm', link.value)
}

</script>