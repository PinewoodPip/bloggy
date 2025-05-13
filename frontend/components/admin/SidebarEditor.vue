<!-- Component for editing the site's sidebar. -->
<template>
  <div class="flexcol">
    <SimpleEditor v-if="sidebarStatus !== 'pending'" ref="editorRef">
      <template #document>
        <div class="relative">
          <EditorDocument key="editorDocument" ref="documentRef" :initial-content="sidebar?.content || ''" />
        </div>
      </template>
    </SimpleEditor>
    <LoadingSpinner v-else />
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import * as Tools from '~/src/editor/ToolManager'

const { data: config, status: configStatus } = useSiteConfig()
const siteService = useSiteService()
const responseToast = useResponseToast()
const editorRef = useTemplateRef('editorRef')
const articlePath = useArticlePath()
const document = useTemplateRef('documentRef')
const editor = ref(useSidebarEditor(() => document.value!.editorView))
useEditorProvides(editor, document)

const props = defineProps<{
}>();

const emit = defineEmits<{
}>();

/** Returns the serialized document text. */
function getContent(): string | null {
  const state = editorDocument.value?.editorState!
  if (state.doc.textContent.length == 0) {
    return null
  } else {
    const markdown = editor.value.serializeDocument(state)
    return markdown
  }
}
defineExpose({
  getContent,
})

const editorDocument = computed(() => {
  return document.value
})

/** Query for the sidebar document. */
const { data: sidebar, status: sidebarStatus, suspense: sidebarSuspense } = useQuery({
  queryKey: ['sidebarDocument'],
  queryFn: async () => {
    try {
      return await siteService.getSidebar()
    } catch (err) {
      // Sidebar not set in the site config
      if ((err as AxiosError).status == 404) {
        return { content: '' }
      }
    }
  },
})

</script>