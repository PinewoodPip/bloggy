<template>
  <SitePage>
    <template #content>
      <div v-if="category" ref="contentTop" class="flexcol">
        <div class="flexcol gap-y-3">
          <div class="large-content-block">
            <!-- Breadcrumb navigation -->
            <SiteBreadcrumbs />

            <!-- Category header and description -->
            <h1>{{ category.name }}</h1>
            <p v-if="category.description !== ''">{{ category.description }}</p>

            <!-- TODO show most-used tags and authors of the articles -->
          </div>

          <!-- Articles -->
          <SiteArticlePreview v-for="article in category.articles" :article="article" />
        </div>

        <!-- Pagination -->
        <div class="join outline outline-2 outline-neutral/20 mx-auto mt-4">
          <!-- Previous page buttons -->
          <button class="join-item btn" :disabled="currentPage == 1" @click="currentPage = 1"><<</button>
          <button class="join-item btn" :disabled="currentPage == 1" @click="currentPage -= 1"><</button>
          <button v-for="index in previousPageIndices" class="join-item btn" @click="currentPage = index">{{ index }}</button>

          <!-- Current page -->
          <button class="join-item btn">Page {{ currentPage }}</button>

          <!-- Next page buttons -->
          <button v-for="index in nextPageIndices" class="join-item btn" @click="currentPage = currentPage + index">{{ currentPage + index }}</button>
          <button class="join-item btn" :disabled="currentPage == totalPages" @click="currentPage += 1">></button>
          <button class="join-item btn" :disabled="currentPage == totalPages" @click="currentPage = totalPages">>></button>
        </div>
      </div>
    </template>
  </SitePage>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

const categoryService = useCategoryService()
const responseToast = useResponseToast()
const router = useRouter()
const route = useRoute()
const contentTopRef = useTemplateRef('contentTop')

/** Max dedicated buttons to jump to adjacent pages */
const ARTICLES_PER_PAGE = 5
const MAX_NEIGHBOUR_PAGE_BUTTONS = 3

const currentPage = ref(1)

// Pagination getters
const totalPages = computed(() => {
  return (category.value && category.value.total_articles > 0) ? Math.ceil(category.value.total_articles / ARTICLES_PER_PAGE) : 1 // Avoid division by 0 for empty categories
})
const previousPageIndices = computed(() => {
  return Math.min(currentPage.value - 1, MAX_NEIGHBOUR_PAGE_BUTTONS) // Limit amount of buttons for going to previous pages
})
const nextPageIndices = computed(() => {
  return Math.min(totalPages.value - currentPage.value, MAX_NEIGHBOUR_PAGE_BUTTONS) // Limit amount of buttons for going to next pages
})

// Refetch articles and scroll back to the top when the page index changes
watch(currentPage, () => {
  refetchCategory()
  scrollViewToElement(contentTopRef) // Scroll back to top
})

/** Query for fetching category articles */
const { data: category, status: categoryStatus, suspense: categorySuspense, refetch: refetchCategory } = useQuery({
  queryKey: ['category_' + (route.params.category_path as string[]).join('/')],
  queryFn: async () => {
    const categoryPath = '/' + (route.params.category_path as string[]).join('/')
    return await categoryService.getCategory(categoryPath, ARTICLES_PER_PAGE, (currentPage.value - 1) * ARTICLES_PER_PAGE)
  },
  retry: (count, err) => {
    if ((err as AxiosError).status === 404) {
      // Redirect back to home if the article URL is invalid
      responseToast.showError('Category not found')
      router.push('/') 
    } else if (count == 1) { // Show error on first failed fetch
      responseToast.showError('Failed to load category', err)
    }
    return true
  }
})
await categorySuspense(); // Have the server wait for the request to resolve

</script>