<template>
  <JSDOMProvider />
  <div ref="editorRef" class="editor" />
  <div style="display: none" id="content">
  </div>
</template>

<script setup lang="ts">
import { useMarkViewFactory, useNodeViewFactory, usePluginViewFactory, useWidgetViewFactory } from '@prosemirror-adapter/vue'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { Schema } from 'prosemirror-model'
import { DecorationSet, EditorView } from 'prosemirror-view'
import { createEditorView } from './createEditorView'
import Heading from './node/Heading.vue'
import Paragraph from './node/Paragraph.vue'
import CodeBlock from './node/CodeBlock.vue'
import Footnote from './node/Footnote.vue'
import Image from './node/Image.vue'
import Embed from './node/Embed.vue'
import Annotation from './decoration/Annotation.vue'
import Underline from './mark/Underline.vue'
import Link from './mark/Link.vue'
import { CreateDocumentParser, Markdown } from '~/src/editor/markdown/Parser'
import { plugin as UnderlinePlugin } from '~/src/editor/markdown/plugins/underline'
import markdownit from 'markdown-it'
import type { CommentState } from '~/composables/editor/plugins/Annotations'

const nodeViewFactory = useNodeViewFactory()
const markViewFactory = useMarkViewFactory()
const pluginViewFactory = usePluginViewFactory()
const widgetViewFactory = useWidgetViewFactory()
const getAnnotationWidget = widgetViewFactory({
  as: 'span',
  component: Annotation,
})

const props = defineProps<{
  initialContent: string,
  schema: Schema,
  readonly?: boolean,
}>()
const schema = toRaw(props.schema) // Necessary to avoid jank with the editor re-rendering all the time

const emit = defineEmits<{
  initialized: [EditorView],
}>();

const editorRef = ref<HTMLDivElement | null>(null)
const editorView: Ref<EditorView|null> = ref(null)
const editorState: Ref<EditorState|null> = ref(null)
const placeholderHTML: Ref<string | null> = ref(null) // Shown by SSR
const initialized = ref(false)

defineExpose({
  editorView,
  editorState,
})

watchEffect((onCleanup) => {
  if (initialized.value) return

  const el = import.meta.client ? editorRef.value : null
  if (!el && import.meta.client) {
    return 
  }

  const stateCallback = (newState: EditorState) => {
    editorState.value = newState
  }

  console.log("Article string:\n", props.initialContent)
  console.log("Markdown tokens:\n", Markdown.parse(props.initialContent, {}))
  
  const parser = CreateDocumentParser(schema)
  const deserializedContent = parser.parse(props.initialContent)
  console.log("Parsed PM document:\n", deserializedContent)

  const view = createEditorView(el, deserializedContent, {
      paragraph: nodeViewFactory({
        component: Paragraph,
        as: 'div',
        contentAs: 'p',
      }),
      code_block: nodeViewFactory({
        component: CodeBlock,
        as: 'div',
        contentAs: 'pre',
      }),
      heading: nodeViewFactory({
        component: Heading,
      }),
      footnote: nodeViewFactory({
        component: Footnote,
      }),
      image: nodeViewFactory({
        component: Image,
      }),
      embed: nodeViewFactory({
        component: Embed,
      }),
    },
    [
      new Plugin({
        props: {
          decorations(state) {
            const { $from, from } = state.selection
            const node = $from.node()

            // Fetch comment plugin
            const commentPlugin = ProseMirrorUtils.getPlugin(state, 'comment$')
            if (!commentPlugin) return
            const pluginState = commentPlugin.getState(state) as CommentState

            // Determine position to place the widget at
            let pos;
            try {
              pos = $from.before() // Selecting nodes at the top level of the document will cause before() to throw
            } catch {
              pos = from // Fallback to cursor position - fine in the root case, as it won't be in the middle of a node (so it won't displace other nodes)
            }

            // Create widget
            const widget = getAnnotationWidget(pos + 1, {
              side: -1,
              comments: pluginState.commentsAt(from),
            })
            return DecorationSet.create(state.doc, [widget])
          },
          markViews: {
            underline: markViewFactory({
              component: Underline,
            }),
            link: markViewFactory({
              component: Link,
            }),
          }
        },
      }),
    ],
    stateCallback,
    (view, state) => {
      return !props.readonly
    }
  )
  editorState.value = view.state

  if (import.meta.server) {
    view.update({state: view.state}) // Required for node content to be inserted
    const md = markdownit() // TODO extract
    md.use(UnderlinePlugin)
    const result = md.render(props.initialContent)
    // placeholderHTML.value = view.dom.outerHTML // ProseMirror DOM
    placeholderHTML.value = result
  } else {
    // placeholderHTML.value = null
  }
  if (import.meta.client) {
    editorView.value = view
  }

  initialized.value = true
  emit('initialized', editorView.value!)

  onCleanup(() => {
    // Older versions used to re-initialize the view, but this was unnecessary and led to hot-reload issues.
    // view.destroy()
    // editorView.value = null
    // initialized.value = false
  })
})
</script>


<style src="@mdit/plugin-alert/style"></style>
<style>
.editor {
  color: oklch(--pc);
  background-clip: padding-box;
  border-radius: 4px;
  padding: 5px 0;
  position: relative;
}

/* Images */
.editor img {
  display: inline; 
}

/* Alerts */
.markdown-alert {
  @apply bg-base-300 shadow-md
}

/* Bullet list items */
.editor ul > li::marker {
  content: "•";
  @apply text-lg
}
.editor ul > li {
  @apply pl-2
}

/* Ordered list items */
.editor ol > li {
  list-style-type: decimal;
  @apply pl-2
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
  padding: 0px 8px 0px 14px;
  line-height: 1.2;
  outline: none;
}

.ProseMirror p { margin-bottom: 1em }

.ProseMirror blockquote {
  border-left: 3px solid oklch(var(--s)) !important
}

/** Highlight annotations with a background color. */
.pm-annotation {
  @apply bg-accent/20
}

</style>