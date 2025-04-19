<!-- Embed node view. -->
<template>
  <div class="opacity-50 w-full" @click="onClick">
    <iframe class="pointer-events-none mx-auto" v-if="embedURL" :src="embedURL"></iframe>
  </div>
</template>

<script setup lang="ts">
import { useNodeViewContext } from '@prosemirror-adapter/vue'
import type { NodeCallbacks } from '~/components/editor/Document.vue'

const { contentRef, node } = useNodeViewContext()
const mediaUtils = useMediaEmbeds()
const nodeCallbacks = inject<NodeCallbacks>('nodeCallbacks')

/** iframe-compatible URL. */
const embedURL = computed(() => {
  const attrs = node.value.attrs
  return mediaUtils.getEmbedURL(attrs.type, attrs.contentID)
})

/** Notify the editor when the embed is selected. */
function onClick() {
  nodeCallbacks?.selectNode(node.value)
}

</script>