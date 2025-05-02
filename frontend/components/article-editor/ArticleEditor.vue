<!-- An editor for site articles. -->
<template>
  <UContainer class="flexcol gap-y-2">
    <!-- Header -->
    <ArticleEditorHeader :article="articleData" @metadata-updated="onMetadataUpdated" @toggle-sidebar="sidebarVisible = !sidebarVisible" />

    <!-- Toolbar; only rendered once editor is initialized -->
    <ArticleEditorToolbar v-if="editorDocument?.editorState" />

    <!-- Content area -->
    <div class="flex gap-x-2">
      <!-- Sidebar -->
      <div v-if="sidebarVisible" class="large-content-block max-w-md max-h-fit">
        <ArticleEditorSidebar @heading-selected="onHeadingSelected" @hide="sidebarVisible = false" />
      </div>

      <!-- Document -->
      <div class="large-content-block flex-grow" @contextmenu.prevent="onContextMenu">
        <EditorDocument v-if="articleData" key="editorDocument" ref="document" :initial-content="initialContent!" @initialized="onEditorInitialized" />
        <LoadingSpinner v-else />
      </div>
    </div>

    <!-- Status bar -->
    <ArticleEditorStatusBar class="fixed left-0 bottom-0 w-full" />

    <!-- Context menu -->
    <EditorDocumentContextMenu ref="contextMenu" />

    <!-- Widgets -->
    <EditorWidgetsManager ref="widgets" />
  </UContainer>
</template>
<script setup lang="ts">
import { Node } from 'prosemirror-model'
import type { Heading } from './Sidebar.vue'
import type { AnnotationAttrs } from '~/src/editor/Editor'
import { Comment } from '~/composables/editor/plugins/Annotations'

/** Callbacks available to node renderers. */
export type NodeCallbacks = {
  /** Notifies that the node should be selected for a node type-specific interaction. */
  selectNode(node: Node): void,
}

const router = useRouter()

const editor = ref(useArticleEditor(() => editorDocument.value!.editorView))
const editorDocument = useTemplateRef('document')
const contextMenu = useTemplateRef('contextMenu')
const widgets = useTemplateRef('widgets')
useEditorProvides(editor, editorDocument)
const { editorView } = useEditorInjects()
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

/** Provide callbacks for nodes to notify they should be selected. */
provide<NodeCallbacks>('nodeCallbacks', {
  selectNode(node: Node) {
    const schema = toRaw(editor.value).schema
    if (node.type === schema.nodes.footnote) {
      widgets.value!.selectFootnote(node)
    } else if (node.type === schema.nodes.image) {
      widgets.value!.selectImage(node)
    } else if (node.type === schema.nodes.embed) {
      widgets.value!.selectEmbed(node)
    }
  }
})

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

/** Default states of ProseMirror plugins. */
const initialPluginStates = computed(() => {
  return {
    annotations: articleData.value?.annotations,
  }
})

/** The default editor document text. */
const initialContent = computed(() => {
  return articleData.value?.content
})

/** Initializes ProseMirror plugin states. */
function onEditorInitialized() {
  const states = initialPluginStates.value

  // Set annotations
  if (states.annotations) {
    for (const annotation of states.annotations) {
      const state = editorView.value.state
      const commentPlugin = ProseMirrorUtils.getPlugin(state, 'comment$')
      // A transaction can only set 1 plugin meta, thus we need to dispatch a transaction for each annotation.
      let tr = state.tr
      tr = tr.setMeta(commentPlugin, {type: "newComment", from: annotation.start, to: annotation.end, comment: new Comment(annotation.comment, annotation.id, annotation.author.username)})
      editorView.value.dispatch(tr)
    }
  }
}

</script>

<style lang="css" scoped>

.field-autosize {
  /* Auto-sizes input elements based on content */
  field-sizing: content;
}

</style>