<template>
  <SitePage :title="pageTitle">
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
const siteMeta = useSiteMeta()
const route = useRoute()

/** The text being searched. */
const textQuery = computed(() => {
  return route.query.text as string
})

/** The tags being searched. */
const tags = computed(() => {
  const param = route.query.tag
  if (!param) {
    return undefined
  } else {
    return typeof param === 'string' ? [param as string] : (param as string[])
  }
})

/** The display names of the authors being searched. */
const authors = computed(() => {
  const param = route.query.author
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

/** Page tab title. */
const pageTitle = computed(() => {
  return `${searchQueryLabel.value}${siteMeta.value.titleSuffix}`
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
  if (authors.value) {
    queries.push('articles by ' + authors.value.join(', '))
  }
  return queries.join(', ')
})

// Required for query catching and automatic re-fetching
const query = computed(() => {
  return route.query
})

/** Query for search results. */
const { data: searchResults, status: searchStatus, refetch: search } = useQuery({
  queryKey: ["siteFullSearch", query],
  queryFn: async () => {
    const results = await SearchService.searchArticles({
      tags: tags.value,
      text: textQuery.value,
      authors: authors.value,
    })
    return results
  },
})

/** Redirect back to home if the page is accessed with no search query params. */
definePageMeta({
  middleware: 'search'
})

</script>