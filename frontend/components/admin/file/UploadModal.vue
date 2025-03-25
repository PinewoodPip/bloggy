<!-- Modal for uploading files to the CMS. -->
<template>
  <FullscreenModal v-model="openModel" :can-confirm="canConfirm" :confirm-callback="confirm">
    <template #headerTitle>
      <h2>Upload file</h2>
    </template>
    <template #form>
      
      <FormGroupInputField v-model="fileModel.path" label="Path" hint="Must end in an extension." icon="material-symbols:folder" :required="true" />
      <FormGroupInputField v-model="content" label="File" icon="material-symbols:image-arrow-up" type="file" :required="true" @change="onFileChanged" />

    </template>

    <template #footer>
      <MutationButton class="btn-primary" icon="i-material-symbols-article-rounded" :status="creationStatus" :disabled="!canConfirm" @click="confirm">Upload</MutationButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query';

const fileService = useFileService()
const responseToast = useResponseToast()

const emit = defineEmits<{
  create: [SiteFile],
}>()

const openModel = defineModel('open', {
  default: false,
})

const fileModel = defineModel<{
  originalPath: string,
  path: string,
}>('file', {required: true})

const content = ref('')
const encodedContent = ref('')

// Reset form when the modal is re-opened
watch(openModel, () => {
  content.value = ''
  encodedContent.value = ''
})

function confirm() {
  requestCreation({
    content: encodedContent.value,
    path: fileModel.value.path,
  })
}

const canConfirm = computed(() => {
  return encodedContent.value !== null
})

/** Encodes chosen file as base64 string. */
async function onFileChanged(e: InputEvent) {
  // @ts-ignore
  const file = e.target!.files[0]
  let blob = new Blob([file])

  var reader = new FileReader();
  reader.readAsDataURL(blob); 
  reader.onloadend = function() {
    var base64data: string = reader.result! as string;  
    const trimmed = base64data.substring(base64data.indexOf(',') + 1) // Remove the data type prefix
    encodedContent.value = trimmed
  }
}

/** Query for uploading the file. */
const { mutate: requestCreation, status: creationStatus } = useMutation({
  mutationFn: (request: SiteFileCreationRequest) => {
    return fileService.putFile(fileModel.value.originalPath, request)
  },
  onSuccess: (file) => {
    emit('create', file)
    responseToast.showSuccess('File uploaded')
    openModel.value = false // Close the modal
  },
  onError: (err) => {
    responseToast.showError('Failed to create article', err)
  }
})

</script>