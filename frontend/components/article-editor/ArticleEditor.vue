<!-- An editor for site articles. -->
<template>
  <UContainer class="flexcol gap-y-2">
    <!-- Header -->
    <ArticleEditorHeader ref="editorHeader" :article="articleData" @metadata-updated="onMetadataUpdated" @toggle-sidebar="sidebarVisible = !sidebarVisible" @exit="emit('exit')" />

    <!-- Toolbar; only rendered once editor is initialized -->
    <ArticleEditorToolbar v-if="editorDocument?.editorState" />

    <!-- Content area -->
    <div class="flex gap-x-2">
      <!-- Sidebar; needs a high top margin due to the toolbar also being sticky -->
      <div v-if="sidebarVisible" class="large-content-block sticky top-[4.5rem] max-w-md max-h-fit">
        <ArticleEditorSidebar @heading-selected="onHeadingSelected" @hide="sidebarVisible = false" />
      </div>

      <!-- Document -->
      <!-- Has extra bottom margin to compensate for sticky status bar -->
      <div class="large-content-block flex-grow mb-[4rem]" @contextmenu.prevent="onContextMenu">
        <EditorDocument v-if="articleData" key="editorDocument" ref="document" :initial-content="initialContent!" @initialized="onEditorInitialized" />
        <LoadingSpinner v-else />

        <FaintHr class="mb-3" />

        <!-- Tags -->
        <div class="flex gap-x-2">
          <UTooltip v-for="tag in articleData?.tags" text="Remove tag">
            <SiteArticleTag class="cursor-pointer" :key="tag" :tag="tag" :disable-link="true" @click="removeTag(tag)" />
          </UTooltip>
          <UTooltip text="Add tag">
            <SiteArticleTag class="cursor-pointer" tag="+" :hide-prefix="true" :disable-link="true" @click="openMetadataModal" />
          </UTooltip>
        </div>
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

const emit = defineEmits<{
  exit: [],
}>();

const router = useRouter()

const editor = ref(useArticleEditor(() => editorDocument.value!.editorView))
const editorDocument = useTemplateRef('document')
const contextMenu = useTemplateRef('contextMenu')
const widgets = useTemplateRef('widgets')
const editorHeader = useTemplateRef('editorHeader')
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

/** Removes a tag from the article. Updates the article on the CMS immediately. */
function removeTag(tag: string) {
  if (!articleData.value) return
  const newTags = articleData.value.tags.filter(t => t !== tag)
  editorQueries.articleMutation.mutate({
    is_draft: true,
    tags: newTags,
  })
}

function onContextMenu() {
  contextMenu.value!.open()
}

/** Opens the modal to edit article properties. */
function openMetadataModal() {
  editorHeader.value!.editDocumentProperties()
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