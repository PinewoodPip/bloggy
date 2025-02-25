<template>
  <div ref="editorRef" class="editor" />
  <!-- TODO remove placeholder -->
  <div style="display: none" id="content">
    <h3>Hello ProseMirror</h3>
  
    <blockquote>
        <p>This is editable text. You can focus it and start typing.</p>
    </blockquote>
  
    <p>To apply styling, you can select a piece of text and manipulate
    its styling from the menu. The basic schema
    supports <em>emphasis</em>, <strong>strong
    text</strong>, <a href="http://marijnhaverbeke.nl/blog">links</a>, <code>code
    font</code>, and <img src="https://prosemirror.net/img/smiley.png"> images.</p>
  
    <p>Block-level structure can be manipulated with key bindings (try
    ctrl-shift-2 to create a level 2 heading, or enter in an empty
    textblock to exit the parent block), or through the menu.</p>
  
    <p>Try using the “list” item in the menu to wrap this paragraph in
    a numbered list.</p>
    </div>
</template>

<script setup lang="ts">
import { useNodeViewFactory, usePluginViewFactory, useWidgetViewFactory } from '@prosemirror-adapter/vue'
import { EditorState, Plugin } from 'prosemirror-state'
import { DecorationSet, EditorView } from 'prosemirror-view'
import { createEditorView } from './createEditorView'
import Hashes from './node/Hashes.vue'
import Heading from './node/Heading.vue'
import Paragraph from './node/Paragraph.vue'
import Size from './Size.vue'

const nodeViewFactory = useNodeViewFactory()
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

watchEffect((onCleanup) => {
  const el = editorRef.value
  if (!el) {
    return 
  }

  const view = createEditorView(el, {
    paragraph: nodeViewFactory({
      component: Paragraph,
      as: 'div',
      contentAs: 'p',
    }),
    heading: nodeViewFactory({
      component: Heading,
    }),
  }, [
    // Document size display
    new Plugin({
      view: pluginViewFactory({
        component: Size,
      }),
    }),
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