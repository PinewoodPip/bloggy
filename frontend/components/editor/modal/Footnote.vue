<!-- Modal for inserting/editing footnotes. -->
<template>
  <FullscreenModal v-model="visible">
    <template #headerTitle>
      Edit footnote
    </template>
    <template #form>
      <textarea v-model="footnote.text" class="textarea textarea-primary" />
    </template>
    <template #footer>
      <IconButton class="btn-primary" icon="i-material-symbols-edit-document" @click="onConfirmFootnote">Confirm</IconButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import type { Reactive } from 'vue'
import type { FootnoteAttrs } from '~/src/editor/Editor'

const emit = defineEmits<{
  confirm: [FootnoteAttrs],
}>()

const footnote: Reactive<FootnoteAttrs> = reactive({
  index: 0,
  text: '',
})

const visible = ref(false)

/** Opens the modal. Attrs may be provided to edit an existing footnotes's attrs. */
function open(attrs?: FootnoteAttrs) {
  // Reset values
  footnote.index = 0
  footnote.text = ''

  // Copy attrs
  for (const key in attrs) {
    // @ts-ignore
    footnote[key] = attrs[key]
  }

  visible.value = true
}
defineExpose({
  open,
})

function onConfirmFootnote() {
  emit('confirm', footnote)
  visible.value = false
}


</script>