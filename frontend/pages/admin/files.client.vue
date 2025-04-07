<template>
  <AdminPage header="Content" icon="material-symbols:image-outline" hint="Manage images and other files.">
    <div class="flex py-3">
      <IconedInput v-model="searchTerm" icon="i-heroicons-magnifying-glass" placeholder="Search..."/>

      <HorizontalFill/>

      <IconButton class="btn-primary btn-md" icon="material-symbols:upload" @click="onUploadFileRequested">Upload file</IconButton>
    </div>

    <hr/>

    <!-- Content tree -->
    <div class="flex-grow overflow-x-auto">
      <div v-if="contentStatus == 'success' && contentTree" class="flexcol gap-y-2">
        <!-- Render root folder; subfolders will be rendered recursively -->
        <AdminTreeItem :item="contentTree"  @create-leaf="onFileUploadRequested" @create-node="onFileUploadRequested" @edit="onFileUploadRequested" @click="onItemClick" />
      </div>
      <div v-else class="loading loading-spinner" />
    </div>
  </AdminPage>

  <!-- File upload modal -->
  <AdminFileUploadModal v-model:open="fileUploadModalVisible" v-model:file="fileUpload" @create="onContentChanged" />
</template>

<script setup lang="ts">
import type { TreeItemGetters } from '~/components/admin/TreeItem.vue'

provide<TreeItemGetters<SiteFileTree, SiteFile>>('siteFileTree', useSiteFileTree())
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

</script>