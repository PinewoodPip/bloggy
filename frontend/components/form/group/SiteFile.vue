<!-- A form component for selecting files from the site's CMS. -->
<template>
  <UFormGroup :required="required">
    <FormInputField class="select-none" v-model="selectedFile" placeholder="Select file..." :icon="icon" type="text" @click.prevent="onClick" readonly />

    <!-- File selection modal -->
    <AdminModalFileSelect ref="fileSelectModal" @confirm="onFileSelected" :can-select-files="true" />
  </UFormGroup>
</template>

<script setup lang="ts">

const fileSelectModal = useTemplateRef('fileSelectModal')

const props = defineProps<{
  placeholder?: string,
  icon: string,
  required?: boolean,
  type?: string,
}>()

const selectedFile = defineModel({
  default: '',
})

/** Opens the file selection modal. */
function onClick() {
  fileSelectModal.value?.open()
}

function onFileSelected(filePath: string) {
  selectedFile.value = filePath
}

</script>