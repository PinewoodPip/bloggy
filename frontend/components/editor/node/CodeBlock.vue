<!-- Code block node view. Allows setting language attr. -->
<template>
  <div :class="{ selected }" class="flexcol relative mockup-code my-3" role="presentation">
    <!-- Language selector; shown only while editing the document -->
    <hr class="after:!bg-neutral-content/20 !my-0" />
    <label for="languageSelect" class="invisible max-h-0">Language select</label>
    <select v-if="editorView?.editable" id="languageSelect" v-model="languageName" contenteditable="false" @change="onLanguageChanged()" class="select select-sm !absolute top-2 right-2 select-ghost w-full max-w-xs">
      <option disabled value="">Choose language...</option>
      <option v-for="option in languageDropdownItems" :key="option.id" :value="option.id">{{ option.name }}</option>
    </select>
    <IconButton v-else class="btn btn-sm btn-ghost absolute top-2 right-2" icon="material-symbols:content-copy" @click="copyCode">
      Copy
    </IconButton>
    <div :ref="contentRef" class="p-3 px-5"></div>
  </div>
</template>

<script setup lang="ts">
import { Multiselect as VueMultiselect } from 'vue-multiselect'
import { useNodeViewContext } from '@prosemirror-adapter/vue'
import { common } from 'lowlight'

interface LanguageOption {
  id: string,
  name: string,
}

const { editorView } = useEditorInjects()
const { contentRef, selected, node, view } = useNodeViewContext()
const responseToast = useResponseToast()
const languageName = ref(node.value.attrs.language)

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
  languageName.value = node.value.attrs.language
})
onMounted(() => {
  languageName.value = node.value.attrs.language
})

/** Copies the code block's text to the clipboard. */
function copyCode() {
  const code = node.value.textContent
  navigator.clipboard.writeText(code).then(() => {
    responseToast.showSuccess('Code copied to clipboard')
  }).catch((err) => {
    responseToast.showError('Failed to copy code')
  })
}

/** Updates the node's language attribute. */
function onLanguageChanged() {
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
  tr = tr.setNodeAttribute(startPos , 'language', languageName.value)

  view.dispatch(tr)
}

</script>

<style scoped>
.selected {
    outline: blue solid 1px;
}
</style>

<style>
/* Remove forced pseudo-element from daisyUI's code blocks */
.mockup-code pre:before {
  content: unset !important;
  margin-right: unset !important;
}

/*
 * Github code highlighting scheme
 * Source: https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.0/styles/github-dark.min.css
 */
.hljs{color:#c9d1d9;background:#0d1117}.hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#ff7b72}.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#d2a8ff}.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable{color:#79c0ff}.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#a5d6ff}.hljs-built_in,.hljs-symbol{color:#ffa657}.hljs-code,.hljs-comment,.hljs-formula{color:#8b949e}.hljs-name,.hljs-quote,.hljs-selector-pseudo,.hljs-selector-tag{color:#7ee787}.hljs-subst{color:#c9d1d9}.hljs-section{color:#1f6feb;font-weight:700}.hljs-bullet{color:#f2cc60}.hljs-emphasis{color:#c9d1d9;font-style:italic}.hljs-strong{color:#c9d1d9;font-weight:700}.hljs-addition{color:#aff5b4;background-color:#033a16}.hljs-deletion{color:#ffdcd7;background-color:#67060c}
</style>