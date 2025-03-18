<!-- Code block node view. Allows setting language attr. -->
<template>
  <div :class="{ selected }" class="flexcol bg-secondary/20 border-separate rounded-box shadow-md" role="presentation">
    <div class="bg-secondary/50 rounded-t-box p-2">
      <!-- TODO make nicely tab-selectable somehow -->
      <VueMultiselect class="ml-auto max-w-48" v-model="language" :options="languageDropdownItems" :searchable="true" :multiple="false" :close-on-select="true" :show-labels="true" track-by="id" label="name" placeholder="Choose language..." aria-label="choose language" @update:modelValue="onLanguageChanged" tabindex="-1"></VueMultiselect>
    </div>
    <div :ref="contentRef" class="p-3"></div>
  </div>
</template>

<script setup lang="ts">
import { Multiselect as VueMultiselect } from 'vue-multiselect'
import { useNodeViewContext } from '@prosemirror-adapter/vue'
import { common,  } from 'lowlight'

interface LanguageOption {
  id: string,
  name: string,
}

const { contentRef, selected, node, view } = useNodeViewContext()
const language: Ref<LanguageOption> = ref({id: "javascript", name: "JavaScript"})

/** Language options for syntax highlighting. */
const languageDropdownItems = computed(() => {
  const languages: LanguageOption[] = []
  for (const key in common) {
    languages.push({
      id: key,
      name: StringUtils.capitalize(key),
    })
  }
  return languages
})

// Synchronize node language attribute with the ref for vue-multiselect
watch(node, () => {
  language.value = {
    id: node.value.attrs.language,
    name: node.value.attrs.language,
  }
})
onMounted(() => {
  language.value = {
    id: node.value.attrs.language,
    name: node.value.attrs.language,
  }
})

function onLanguageChanged(option: LanguageOption) {
  let tr = view.state.tr
  const doc = view.state.doc

  // Find node position
  let startPos = 0
  let endPos = 0
  doc.forEach((docNode, offset, index) => {
      if (node.value == docNode) {
          startPos = offset;
          endPos = offset + docNode.nodeSize;
      }
  });

  // Change node attribute
  tr = tr.setNodeAttribute(startPos , 'language', option.name)

  view.dispatch(tr)
}

</script>

<style scoped>
.selected {
    outline: blue solid 1px;
}
</style>