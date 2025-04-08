import { useQuery } from "@tanstack/vue-query"

type ContentTreeNode = Category | ArticlePreview

/** Provides TreeItem node getter functions for the tree of articles & categories. */
export const useContentTreeGetters = () => {
  return {
    leafIcon: "material-symbols:article",
    canCollapse: true,

    getNodeType(node: ContentTreeNode) {
      return 'filename' in node ? 'leaf' : 'node'
    },
    getTooltip(node: ContentTreeNode) {
      // @ts-ignore
      return node.title || node.name
    },
    getChildrenNodes(file: ContentTreeNode) {
      // @ts-ignore
      if (file.directory_name === undefined) return []
      file = file as Category
      let subcategories = file.subcategories
      return subcategories
    },
    getChildrenLeafs(tree: ContentTreeNode) {
      // @ts-ignore
      return tree.articles || []
    },
    getName(tree: ContentTreeNode) {
      // @ts-ignore
      return tree.name || tree.title
    },
    canCreateLeaf(node: ContentTreeNode) {
      return this.getNodeType(node) === 'node'
    },
    canCreateNode(node: ContentTreeNode) {
      return this.getNodeType(node) === 'node'
    },
    canEditNode() {
      return true
    },
    canDeleteNode() {
      return false
    },
    canEditLeaf() {
      return true
    },
    canDeleteLeaf() {
      return true
    },
  }
}

/** Query to fetch the content tree. */
export const useContentTree = () => {
  const categoryService = useCategoryService()
  const query = useQuery({
    queryKey: ["contentCategories"],
    queryFn: async () => {
      const tree = await categoryService.getCategory('/')
      return tree
    },
  })
  return query
}