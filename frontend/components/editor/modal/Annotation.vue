<!-- Modal for adding/editing editor comments. -->
<template>
  <FullscreenModal v-model="openModel" :can-confirm="canConfirm" :confirm-callback="confirm">
    <template #headerTitle>
      Add comment
    </template>
    <template #form>
      <FormGroupTextArea v-model="comment.comment" label="Comment" hint="Comment." icon="material-symbols:link" />
    </template>
    <template #footer>
      <IconButton class="btn-primary" icon="material-symbols:add-link" :disabled="!canConfirm" @click="confirm">Confirm</IconButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import type { AnnotationAttrs } from '~/src/editor/Editor';

const user = useLoggedInUser()

const emit = defineEmits<{
  confirm: [AnnotationAttrs],
}>()

const comment = reactive({
  comment: '',
})

const openModel = defineModel('open', {
  default: false,
})
const isEditing = ref(false)

/** Opens the modal. Attrs may be provided to edit an existing comment. */
function open(attrs?: AnnotationAttrs) {
  // Reset values
  comment.comment = ''

  // Copy attrs from params
  if (attrs) {
    comment.comment = attrs.comment
  }
  isEditing.value = attrs !== undefined

  openModel.value = true
}
defineExpose({
  open,
})

function confirm() {
  openModel.value = false
  emit('confirm', {
    author: user.data.value!.username,
    comment: comment.comment,
  })
}

/** Comment must not be empty. */
const canConfirm = computed(() => {
  return comment.comment !== ''
})

</script>