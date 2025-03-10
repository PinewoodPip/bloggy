<template>
  <div ref="editorRef" class="editor" />
  <div style="display: none" id="content" v-html="initialContent">
  </div>
</template>

<script setup lang="ts">
import { useMarkViewFactory, useNodeViewFactory, usePluginViewFactory, useWidgetViewFactory } from '@prosemirror-adapter/vue'
import { EditorState, Plugin } from 'prosemirror-state'
import { DecorationSet, EditorView } from 'prosemirror-view'
import { createEditorView } from './createEditorView'
import Hashes from './node/Hashes.vue'
import Heading from './node/Heading.vue'
import Paragraph from './node/Paragraph.vue'
import Underline from './mark/Underline.vue'
import { DocumentParser } from '~/src/editor/markdown/Parser'

const nodeViewFactory = useNodeViewFactory()
const markViewFactory = useMarkViewFactory()
const pluginViewFactory = usePluginViewFactory()
const widgetViewFactory = useWidgetViewFactory()

const getHashWidget = widgetViewFactory({
  as: 'i',
  component: Hashes,
})

const editorRef = ref<HTMLDivElement | null>(null)
const editorView: Ref<EditorView|null> = ref(null)
const editorState: Ref<EditorState|null> = ref(null)

defineExpose({
  editorView,
  editorState,
})

const props = defineProps<{
  initialContent: string,
}>()

watchEffect((onCleanup) => {
  const el = editorRef.value
  if (!el) {
    return 
  }
  
  const deserializedContent = DocumentParser.parse(props.initialContent)
  const view = createEditorView(el, deserializedContent, {
    paragraph: nodeViewFactory({
      component: Paragraph,
      as: 'div',
      contentAs: 'p',
    }),
    heading: nodeViewFactory({
      component: Heading,
    }),
  },
  [
    // Hash display for headings
    new Plugin({
      props: {
        decorations(state) {
          const { $from } = state.selection
          const node = $from.node()
          if (node.type.name !== 'heading')
            return DecorationSet.empty

          const widget = getHashWidget($from.before() + 1, {
            side: -1,
            level: node.attrs.level,
          })

          return DecorationSet.create(state.doc, [widget])
        },
        markViews: {
          underline: markViewFactory({
            component: Underline,
          }),
        }
      },
    }),
  ], (newState) => {
    editorState.value = newState
  })

  editorView.value = view

  onCleanup(() => {
    view.destroy()
    editorView.value = null
  })
})
</script>

<style>
.editor {
  color: oklch(--pc);
  background-clip: padding-box;
  border-radius: 4px;
  padding: 5px 0;
  margin-bottom: 23px;
  position: relative;
}

.ProseMirror p:first-child,
.ProseMirror h1:first-child,
.ProseMirror h2:first-child,
.ProseMirror h3:first-child,
.ProseMirror h4:first-child,
.ProseMirror h5:first-child,
.ProseMirror h6:first-child {
  margin-top: 10px;
}

.ProseMirror {
  padding: 4px 8px 4px 14px;
  line-height: 1.2;
  outline: none;
}

.ProseMirror p { margin-bottom: 1em }

.ProseMirror blockquote {
  border-left: 3px solid oklch(var(--s)) !important
}
</style>