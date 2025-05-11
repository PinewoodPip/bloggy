import { useQuery } from "@tanstack/vue-query"

type TreeNode = SiteFileTree | SiteFile

/** Provides TreeItem node getter functions for child TreeItem components. */
export const useSiteFileTree = () => {
  return {
    leafIcon: "material-symbols:article",
    canCollapse: true,

    getNodeType(node: SiteFileTree | SiteFilePreview) {
      // @ts-ignore
      return node.filename ? 'leaf' : 'node'
    },
    getTooltip(node: TreeNode) {
      // @ts-ignore
      return node.folder_name || node.filename
    },
    getChildrenNodes(file: SiteFileTree) {
      if (!file.folder_name) return []
      let subfolders = file.subfolders
      let orderedSubfolders = [...Object.values(subfolders)]
      return orderedSubfolders
    },
    getChildrenLeafs(tree: SiteFileTree) {
      return tree.files || []
    },
    getName(tree: TreeNode) {
      // @ts-ignore
      return tree.folder_name || tree.filename
    },
    canCreateLeaf(node: TreeNode) {
      // @ts-ignore
      return node.folder_name !== undefined
    },
    canCreateNode() {
      return false
    },
    canEditNode() {
      return false
    },
    canDeleteNode() {
      return false
    },
    canEditLeaf() {
      return true
    },
    canDeleteLeaf() {
      return false
    },
    getTooltipComponent(node: TreeNode) {
      if (this.getNodeType(node) === 'leaf' && this.isImageFile(node as SiteFile)) {
        return {
          component: "img",
          props: {
            src: '/files' + node.path,
            class: 'aspect-square max-h-96',
          }
        }
      }
      return null
    },
    isSelected(node: TreeNode) {
      return false
    },
    
    /** Returns whether the extension of a file is of a common image kind. */
    isImageFile(node: SiteFile) {
      const path = node.path
      for (const extension of CMSUtils.IMAGE_EXTENSIONS) {
        if (path.toLowerCase().endsWith(extension)) {
          return true
        }
      }
      return false
    },
  }
}

/** Query to fetch file tree. */
export const useSiteFiles = () => {
  const fileService = useFileService()
  return useQuery({
    queryKey: ["fileTree"],
    queryFn: async () => {
      const tree = await fileService.getAll()
      return tree
    },
  })
}