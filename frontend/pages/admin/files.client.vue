<template>
  <AdminPage header="Content" icon="material-symbols:image-outline" hint="Manage articles and categories.">
    <div class="flex py-3">
      <IconedInput v-model="searchTerm" icon="i-heroicons-magnifying-glass" placeholder="Search..."/>

      <HorizontalFill/>
    </div>

    <hr/>

    <!-- Content tree -->
    <div class="flex-grow overflow-x-auto">
      <div v-if="contentStatus == 'success' && contentTree" class="flexcol gap-y-2">
      <!-- Render root folder; subfolders will be rendered recursively -->
      <AdminTreeItem :item="contentTree" :node-type-getter="getNodeType" :children-node-getter="getNodeSubnodes" :children-leaf-getter="getNodeLeafs" :name-getter="getNodeName" :tooltip-getter="getNodeTooltip" :can-create-leaf="canCreateLeaf" leaf-icon="material-symbols:article" :can-create-node="() => false" :can-delete-leaf="() => true" :can-edit-node="() => false" :can-delete-node="() => false" :can-edit-leaf="() => true" @create-leaf="onFileUploadRequested" @create-node="onFileUploadRequested" @edit="onFileUploadRequested" @click="onItemClick" />
      </div>
      <div v-else class="loading loading-spinner" />
    </div>
  </AdminPage>

  <!-- File upload modal -->
  <AdminFileUploadModal v-model:open="fileUploadModalVisible" v-model:file="fileUpload" @create="onContentChanged" />
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'

const fileService = useFileService()
const router = useRouter()

const searchTerm = ref("")
const fileUploadModalVisible = ref(false)
const fileUpload = reactive({
  originalPath: '',
  path: '',
  content: null,
})

type TreeNode = SiteFileTree | SiteFile

/** Opens the file upload modal. */
function onFileUploadRequested(node: SiteFileTree | SiteFilePreview) {
  fileUpload.content = null
  fileUpload.path = node.path
  fileUpload.originalPath = node.path
  fileUploadModalVisible.value = true
}

/** Opens files in a new tab. */
function onItemClick(e: SiteFilePreview | SiteFileTree) {
  // TODO
  e = e as SiteFilePreview
  if (e.filename) {
  }
}

// Tree node property getters
function getNodeType(node: SiteFileTree | SiteFilePreview) {
  // @ts-ignore
  return node.filename ? 'leaf' : 'node'
}
function getNodeTooltip(node: TreeNode) {
  // @ts-ignore
  return node.folder_name || node.filename
}
function getNodeSubnodes(file: SiteFileTree) {
  if (!file.folder_name) return []
  let subfolders = file.subfolders
  let orderedSubfolders = [...Object.values(subfolders)]
  return orderedSubfolders
}
function getNodeLeafs(tree: SiteFileTree) {
  return tree.files || []
}
function getNodeName(tree: TreeNode) {
  // @ts-ignore
  return tree.folder_name || tree.filename
}
function canCreateLeaf(node: TreeNode) {
  // @ts-ignore
  return node.folder_name !== undefined
}

/** Refetch categories and articles after management operations */
function onContentChanged() {
  refetchContentTree()
}

/** Query to fetch file tree. */
const { data: contentTree, status: contentStatus, refetch: refetchContentTree } = useQuery({
  queryKey: ["fileTree"],
  queryFn: async () => {
    const tree = await fileService.getAll()
    return tree
  },
})

</script>