<!-- Image node view. -->
<template>
  <!-- Allow resizing the image via the native resize handles while editing the document -->
  <UTooltip ref="containerRef" :class="{ 'resize-y': editorView?.editable }" class="overflow-auto" :text="node.attrs.alt" @mousedown="wasResizing = true">
    <img :style="style" :src="node.attrs.src" :alt="node.attrs.alt" @dblclick="selectNode" loading="lazy" />
  </UTooltip>
</template>

<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'
import type { NodeCallbacks } from '~/components/article-editor/ArticleEditor.vue'
import _debounce from 'lodash.debounce'

const { editorView } = useEditorInjects()
const containerRef = useTemplateRef('containerRef')
const { contentRef, node, setAttrs } = useNodeViewContext()
const nodeCallbacks = inject<NodeCallbacks>('nodeCallbacks')
const resizedHeight = ref(0)
const wasResizing = ref(false)

function selectNode() {
  nodeCallbacks?.selectNode(node.value)
}

/** Update node attributes when the image is resized by the user. */
function onMouseUp() {
  if (wasResizing.value) {
    wasResizing.value = false
    const height = Math.floor(containerRef.value?.$el.clientHeight)
    if (height != node.value.attrs.maxHeight) {
      setAttrs({ maxHeight: height })
    }
  }
}

onMounted(() => {
  // Listen for the user ending resize operations through the handle
  window.addEventListener('mouseup', onMouseUp, false);

  // Track user-resized height of the image
  const observer = new ResizeObserver(function(mutations) {
    const height = Math.floor(mutations[0].contentRect.height)
    if (height != node.value.attrs.maxHeight) {
      resizedHeight.value = height
    }
  });
  observer.observe(containerRef.value?.$el);
})
onUnmounted(() => {
  window.removeEventListener('mouseup', onMouseUp, false);
})

/** Set max height based on node attrs. */
const style = computed(() => {
  const { maxHeight } = node.value.attrs
  return {
    'max-height': `${maxHeight}px`,
  }
})

</script>