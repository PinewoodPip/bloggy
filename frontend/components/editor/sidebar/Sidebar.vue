<!-- Displays the document's structure based on headings. -->
<template>
  <div class="flex items-center gap-x-2 w-52">
    <IconButton class="btn-ghost btn-sm" icon="material-symbols:arrow-back-ios-rounded" @click="emit('hide')" />
    <h2>Table of contents</h2>
  </div>
  <ul class="menu bg-base-200 rounded-box overflow-x-auto">
    <EditorSidebarHeading v-if="headings.length > 0" v-for="heading in headings" :heading="heading" />
    <p v-else class="text-sm text-base-content/80">Headings you add to the document will display here.</p>
  </ul>
</template>

<script setup lang="ts">
const { editorState: state, editorView: view } = useEditorInjects()
const schema = useEditorSchema()

const emit = defineEmits<{
  headingSelected: [Heading],
  hide: [],
}>();

export type Heading = {
  name: string,
  position: integer,
  level: integer,
  subheadings: Heading[],
}

function selectHeading(heading: Heading) {
  emit('headingSelected', heading)
}

/** Tree of headings. */
const headings = computed(() => {
  const topHeadings: Heading[] = []
  const allHeadings: Heading[] = []
  if (!state.value || !state.value.doc) return topHeadings
  const nodes = ProseMirrorUtils.findNodes(state.value, schema.nodes.heading)
  for (const result of nodes) {
    const level = result.node.attrs.level
    const heading: Heading = {
      name: result.node.textContent,
      position: result.startPos,
      level: level,
      subheadings: [],
    }
    // Find closest heading of a previous level (to also properly support ex. H1 > H4 nesting, ie. skipping levels)
    let parent = null
    for (let i = allHeadings.length - 1; i >= 0; i--) {
      const prev = allHeadings[i]
      if (prev.level < heading.level) {
        parent = prev
        break
      }
    }
    if (parent) {
      parent.subheadings.push(heading)
    } else {
      topHeadings.push(heading)
    }
    allHeadings.push(heading)
  }
  return topHeadings
})

export type Callbacks = {
  selectHeading: (heading: Heading) => void,
}
provide<Callbacks>('callbacks', {
  selectHeading: selectHeading,
})

</script>