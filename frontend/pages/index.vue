<!-- Root page of the published site, showing latest articles. -->
<template>
  <SitePaginatedPage ref="paginatedPage" :title="siteTitle" :articles="articles" :total-articles="totalArticles" :articleViewMode="'vertical'" @page-change="onPageChanged">

  <template #pageDescription>
    Latest articles
  </template>

  </SitePaginatedPage>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'

const searchService = useSearchService()
const meta = useSiteMeta()
const page = useTemplateRef('paginatedPage')

const articles = computed(() => {
  return articleResults.value ? articleResults.value.results : []
})

const totalArticles = computed(() => {
  return articleResults.value ? articleResults.value.total_articles : 0
})

/** Refetch articles when page changes. */
function onPageChanged(newPage: integer) {
  refetchArticles()
}

const siteTitle = computed(() => {
  return meta.value.siteName
})

/** Query for fetching latest articles. */
const { data: articleResults, status: categoryStatus, suspense: categorySuspense, refetch: refetchArticles } = useQuery({
  queryKey: ['latestArticles'],
  queryFn: async () => {
    let skip = 0
    let limit = 5
    if (page.value) {
      limit = page.value.ARTICLES_PER_PAGE
      skip = (page.value.currentPage - 1) * limit
    }
    return await searchService.getLatestArticles(limit, skip)
  },
})
await categorySuspense(); // Have the server wait for the request to resolve

</script>