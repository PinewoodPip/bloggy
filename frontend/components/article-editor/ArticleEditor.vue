<!-- An editor for site articles. -->
<template>
  <UContainer class="flexcol gap-y-2">
    <!-- Header -->
    <ArticleEditorHeader :article="articleData" @metadata-updated="onMetadataUpdated" />

    <!-- Toolbar; only rendered once editor is initialized -->
    <ArticleEditorToolbar v-if="editorDocument?.editorState" />

    <!-- Content area -->
    <div class="flex gap-x-2">
      <!-- Sidebar -->
      <div v-if="sidebarVisible" class="large-content-block max-w-md max-h-fit">
        <EditorSidebar @heading-selected="onHeadingSelected" @hide="sidebarVisible = false" />
      </div>

      <!-- Document -->
      <div class="large-content-block flex-grow" @contextmenu.prevent="onContextMenu">
        <EditorDocument v-if="articleData" ref="document" :initial-content="articleData.content" />
        <LoadingSpinner v-else />
      </div>
    </div>

    <!-- Status bar -->
    <EditorStatusBar class="fixed left-0 bottom-0 w-full" />

    <!-- Context menu -->
    <EditorDocumentContextMenu ref="contextMenu" />
  </UContainer>
</template>
<script setup lang="ts">
import type * as Toolbar from '~/src/editor/Toolbar'
import type { Heading } from '~/components/editor/sidebar/Sidebar.vue'

const router = useRouter()

const editor = ref(useArticleEditor(() => editorDocument.value!.editorView))
const editorDocument = useTemplateRef('document')
const contextMenu = useTemplateRef('contextMenu')
useEditorProvides(editor, editorDocument)
const editorQueries = useArticleEditorQueries()

const sidebarVisible = ref(true)

/** Selects and scrolls to a heading. */
function onHeadingSelected(heading: Heading) {
  const state = editorDocument.value?.editorState!
  const view = editorDocument.value?.editorView!
  const domTopPosition = view.coordsAtPos(heading.position).top;

  // Refocus the editor, else the selection will be discarded
  const dom = view.domAtPos(heading.position)
  // @ts-ignore
  dom.node.focus()

  // Select the node
  const selectionTr = ProseMirrorUtils.selectNode(state.tr, heading.position)
  view.dispatch(selectionTr)

  // Scroll to the heading
  document.querySelector('body')?.scrollTo({
    top: domTopPosition,
  })
}

/** The metadata of the article being edited. */
const articleData = computed(() => {
  return editorQueries.articleQuery.data.value
})

function onContextMenu() {
  contextMenu.value!.open()
}

/** Load the user's editor preferences when editor initializes. */
watchEffect(() => {
  editor.value.loadPreferences("ArticleEditor")
})

function onMetadataUpdated(article: Article) {
  // If the filename was changed, the route needs to be updated so we don't get kicked out of the editor due to a 404 on refetch.
  router.replace('/admin/editor?article=' + article.path).then(() => {
    editorQueries.articleQuery.refetch()
  })
}

</script>

<style lang="css" scoped>

.field-autosize {
  /* Auto-sizes input elements based on content */
  field-sizing: content;
}

</style>