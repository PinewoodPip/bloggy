<!-- Search bar widget. -->
<template>
  <div class="dropdown dropdown-end">
    <!-- Search form -->
    <IconedInput v-model="searchTerm" tabindex="0" role="button" icon="i-heroicons-magnifying-glass" placeholder="Search..." @change="onInputFieldChanged" @keyup="onInputFieldChanged" />

    <!-- Dropdown content -->
    <ul v-if="cachedSearchTerm !== ''" tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-10 shadow-sm min-w-96">
      <LoadingSpinner v-if="searchStatus !== 'success'" class="mx-auto my-2" />
      
      <!-- Article results -->
      <li v-for="article in searchResults?.results">
        <article class="flexcol items-start bg-base-100 hover:bg-base-200 rounded-box w-96 p-2">
          <RouterLink class="p-0 px-2" :to="'/articles' + article.path">
            <h2 class="card-title">{{ article.title }}</h2>
          </RouterLink>

          <p class="text-sm">Posted in {{ article.path }}</p>
          <p>{{ article.summary }} ...</p>

          <!-- Tags -->
          <div class="card-actions justify-end w-full">
            <SiteArticleTag v-for="tag in article.tags" :tag="tag" />
          </div>
        </article>
      </li>
      <li v-if="searchResults?.results.length === 0">
        <p>No articles found.</p>
      </li>

      <hr v-if="searchStatus === 'success'" class="faint-hr my-2" />
      
      <!-- "All results" link -->
      <li v-if="searchStatus === 'success'">
        <RouterLink :to="`/search?text=${searchTerm}`">View all results...</RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import _debounce from 'lodash.debounce'

const SearchService = useSearchService()

const SEARCH_DELAY = 500 // Delay in milliseconds before a search is issued after a keystroke, to throttle fetch requests while typing.

const searchTerm = ref('')
const cachedSearchTerm = ref('')

/** Refetches search results. */
function refreshSearch() {
  cachedSearchTerm.value = searchTerm.value // Required for tanstack-query to know the data is stale, as refetches don't invalidate current data
  search()
}

/** Throttles refetching results until the user stops timing for a split second. */
const onInputFieldChanged = computed(() => {
  return _debounce(refreshSearch, SEARCH_DELAY)
})

/** Query for search results. */
const { data: searchResults, status: searchStatus, refetch: search } = useQuery({
  queryKey: ["siteArticleSearch", cachedSearchTerm],
  queryFn: async () => {
    if (searchTerm.value !== '') {
      const results = await SearchService.searchArticles({
        text: searchTerm.value,
      })
      return results
    } else {
      return null
    }
  },
})

</script>