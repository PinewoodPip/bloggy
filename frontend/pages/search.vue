<template>
  <SitePage>
    <template #content>
      <!-- Search results -->
      <div class="flexcol gap-y-3">
        <div class="large-content-block">
          <!-- Crumbs -->
          <SiteBreadcrumbs :crumbs="breadcrumbs" />

          <!-- Current search -->
          <p>Search results for {{ searchQueryLabel }}</p>
        </div>

        <!-- Articles -->
        <LoadingSpinner v-if="searchStatus !== 'success'" class="mx-auto" />
        <div v-if="searchResults?.results.length == 0" class="large-content-block">
          <p>No articles found.</p>
        </div>
        <SiteArticlePreview v-for="article in searchResults?.results" :article="article" />
      </div>

      <!-- TODO pagination -->
    </template>
  </SitePage>
</template>

<script setup lang="ts">
import { SiteBreadcrumbs } from '#components'
import { useQuery } from '@tanstack/vue-query'

const SearchService = useSearchService()
const route = useRoute()

const textQuery = computed(() => {
  return route.query.text as string
})

const tags = computed(() => {
  const param = route.query.tag
  if (!param) {
    return undefined
  } else {
    return typeof param === 'string' ? [param as string] : (param as string[])
  }
})

const breadcrumbs = computed(() => {
  return [
    {
      name: 'Home',
      url: '/'
    },
    {
      name: 'Search',
      url: route.fullPath,
    },
  ]
})

const query = computed(() => {
  return route.query
})

/** Concatenates all search query params into a user-friendly string. */
const searchQueryLabel = computed(() => {
  let queries: string[] = []
  if (textQuery.value) {
    queries.push(`"${textQuery.value}"`)
  }
  if (tags.value) {
    let prefixedTags = tags.value.map((tag) => `#${tag}`)
    queries.push(prefixedTags.join(', '))
  }
  return queries.join(', ')
})

/** Query for search results. */
const { data: searchResults, status: searchStatus, refetch: search } = useQuery({
  queryKey: ["siteFullSearch", query],
  queryFn: async () => {
    const results = await SearchService.searchArticles({
      tags: tags.value,
      text: textQuery.value,
    })
    return results
  },
})

/** Redirect back to home if the page is accessed with no search query params. */
definePageMeta({
  middleware: 'search'
})

</script>