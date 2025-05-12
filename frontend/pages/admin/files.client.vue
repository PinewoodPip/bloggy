<template>
  <AdminPage header="Content" icon="material-symbols:image-outline" hint="Manage images and other files.">
    <div class="flex py-3">
      <IconedInput v-model="searchTerm" icon="i-heroicons-magnifying-glass" placeholder="Search..."/>

      <HorizontalFill/>

      <IconButton class="btn-primary btn-md" icon="material-symbols:upload" @click="onUploadFileRequested">Upload file</IconButton>
    </div>

    <FaintHr class="mb-2"/>

    <!-- Content tree -->
    <div class="flex-grow overflow-x-auto">
      <div v-if="contentStatus == 'success' && contentTree" class="flexcol gap-y-2">
        <!-- Render root folder; subfolders will be rendered recursively -->
        <AdminTreeItem :item="contentTree" @click="onItemClick">
          <!-- File owner -->
          <template #label="{ item: childItem }">
            <UTooltip v-if="childItem.uploader" :text="`Uploaded by ${childItem.uploader.display_name || childItem.uploader.username}`">
              <UserAvatar :user="childItem.uploader" class="my-auto size-6" />
            </UTooltip>
          </template>
          
          <!-- Buttons -->
          <template #buttons="{ canCreateNode, canCreateLeaf, canEdit, item: childItem }">
            <!-- Create file button -->
            <UTooltip v-if="canCreateLeaf" text="Upload file">
              <IconButton class="btn-sm btn-secondary" icon="material-symbols:upload-file" @click.stop="onFileUploadRequested(childItem)" />
            </UTooltip>

            <!-- Edit button -->
            <UTooltip v-if="canEdit" text="Edit">
              <IconButton class="btn-sm btn-secondary" icon="i-material-symbols-edit-outline" @click.stop="onFileUploadRequested(childItem)" />
            </UTooltip>

            <!-- Delete button -->
            <UTooltip v-if="canEdit" text="Delete">
              <IconButton class="btn-sm btn-secondary hover:btn-error" icon="i-material-symbols-delete-outline" @click.stop="onFileDeleteRequested(childItem)" />
            </UTooltip>
          </template>
        </AdminTreeItem>
      </div>
      <div v-else class="loading loading-spinner" />
    </div>
  </AdminPage>

  <!-- File upload modal -->
  <AdminFileUploadModal v-model:open="fileUploadModalVisible" v-model:file="fileUpload" @create="onContentChanged" />
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import type { TreeItemGetters } from '~/components/admin/TreeItem.vue'

provide<TreeItemGetters<SiteFileTree, SiteFile>>('siteFileTree', useSiteFileTree())
const fileService = useFileService()
const responseToast = useResponseToast()
const { data: contentTree, status: contentStatus, refetch: refetchContentTree } = useSiteFiles()

const searchTerm = ref("")
const fileUploadModalVisible = ref(false)
const fileUpload = reactive({
  originalPath: '',
  path: '',
  content: null,
})

/** Opens the file upload modal. */
function onFileUploadRequested(node: SiteFileTree | SiteFilePreview) {
  fileUpload.content = null
  fileUpload.path = node.path
  fileUpload.originalPath = node.path
  fileUploadModalVisible.value = true
}

/** Prompts the user to confirm deleting the file. */
function onFileDeleteRequested(node: SiteFileTree | SiteFilePreview) {
  const file = node as SiteFilePreview
  if (file.filename && confirm(`Are you sure you want to delete ${file.filename}?`)) {
    fileDeletionMutation.mutate(file)
  }
}

/** Opens files in a new tab. */
function onItemClick(item: SiteFilePreview | SiteFileTree) {
  // TODO
  item = item as SiteFilePreview
  if (item.filename) {
    const path = `${window.location.origin}/files${item.path}`
    window.open(path, '_blank')?.focus();
  }
}

/** Opens the upload modal with all fields blank. */
function onUploadFileRequested() {
  fileUpload.content = null
  fileUpload.path = ''
  fileUpload.originalPath = ''
  fileUploadModalVisible.value = true
}

/** Refetch categories and articles after management operations */
function onContentChanged() {
  refetchContentTree()
}

/** Mutation to delete files. */
const fileDeletionMutation = useMutation({
  mutationFn: async (file: SiteFilePreview) => {
    const path = file.path
    return fileService.deleteFile(path)
  },
  onSuccess: () => {
    responseToast.showSuccess('File deleted')
    refetchContentTree()
  },
})

</script>