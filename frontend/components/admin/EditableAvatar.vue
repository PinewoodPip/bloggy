<!-- A form component for selecting an avatar from the CMS. -->
<template>
  <AvatarIcon class="hover:opacity-80 cursor-pointer" v-bind="$attrs" :src="processedURL" @click="selectFile" />

  <!-- File select modal -->
  <AdminModalFileSelect ref="fileModal" :can-select-files="true" @confirm="onFileSelected" />
</template>

<script setup lang="ts">

const fileModal = useTemplateRef('fileModal')

const model = defineModel({
  default: '',
})

function selectFile() {
  fileModal.value?.open()
}

/** Set src url to the file's mapped path in the server. */
function onFileSelected(path: string) {
  model.value = path
}

const processedURL = computed(() => {
  if (model.value.startsWith('/')) {
    return CMSUtils.resolveFilePath(model.value)
  } else {
    return model.value
  }
})

</script>