<template>
  <SitePage>
    <template #content>
      <div v-if="category" ref="contentTop" class="large-content-block flexcol">
        <SiteBreadcrumbs />

        <!-- Category description TODO -->
        <p class="p-3">TODO category description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas aliquet odio non eros porttitor vehicula. Donec eu placerat diam. Sed consequat mi in volutpat tristique. Sed bibendum velit orci, at porta libero volutpat congue. Pellentesque volutpat libero a diam blandit, nec dignissim metus sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus.</p>
        <hr class="faint-hr pb-3 px-3" />

        <!-- Articles -->
        <div class="flexcol gap-y-3">
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
  return category.value ? Math.ceil(category.value.total_articles / ARTICLES_PER_PAGE) : 1
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
  queryKey: ['category_' + route.params.category_path],
  queryFn: async () => {
    return await categoryService.getCategory('/' + route.params.category_path, ARTICLES_PER_PAGE, (currentPage.value - 1) * ARTICLES_PER_PAGE)
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