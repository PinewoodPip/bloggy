<!-- A form component for selecting an image from the CMS with preview. -->
<template>
  <div class="flexcol gap-y-2">
    <label class="text-sm font-medium">{{ label }}</label>
    <UTooltip class="flex content-center border border-base-300 rounded-sm size-24 w-full" :text="imagePath" :popper="{ placement: 'top' }">
      <img v-if="imagePath !== ''" class="object-contain" :src="previewImagePath" />
      <div v-else class="select-none m-auto">No image set</div>
    </UTooltip>
    <IconButton class="btn-secondary" icon="material-symbols:upload-file" @click="onSelectFile">Select file</IconButton>

    <AdminModalFileSelect ref="fileSelectModal" @confirm="onFileSelected" />
  </div>
</template>

<script setup lang="ts">

const fileSelectModal = useTemplateRef('fileSelectModal')

const props = defineProps<{
  label: string,
}>();

const imagePath = defineModel({
  default: '',
})

const previewImagePath = computed(() => {
  return '/files' + imagePath.value
})

function onSelectFile() {
  fileSelectModal.value?.open()
}

function onFileSelected(filePath: path) {
  imagePath.value = filePath
}

</script>