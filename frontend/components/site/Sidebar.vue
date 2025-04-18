<!-- Sidebar for published site pages. -->
<template>
  <div v-if="sidebar" class="large-content-block max-w-80">
    <!-- Will switch from markdown to rich document after mount -->
    <SiteArticleContent v-if="mounted" :initial-content="sidebar?.content" />
    <MarkdownDocument v-else :content="sidebar.content" />
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

const siteService = useSiteService()

const mounted = ref(false)

/** Tracks mounted state. */
onMounted(() => {
  mounted.value = true
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
        return null
      }
    }
  },
})
await sidebarSuspense(); // Have the server wait for the request to resolve

</script>