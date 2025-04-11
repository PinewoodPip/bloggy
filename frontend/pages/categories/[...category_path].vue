<template>
  <SitePaginatedPage ref="paginatedPage" :articles="articles" :total-articles="totalArticles" @page-change="onPageChanged">
    <!-- Page description -->
    <template v-if="category" #pageDescription>
      <!-- Category header and description -->
      <h1>{{ category.name }}</h1>
      <p v-if="category.description !== ''">{{ category.description }}</p>
    </template>
  </SitePaginatedPage>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

const categoryService = useCategoryService()
const responseToast = useResponseToast()
const router = useRouter()
const route = useRoute()
const page = useTemplateRef('paginatedPage')

/** Refetch articles when the page index changes. */
function onPageChanged(newPage: integer) {
  refetchCategory()
}

const articles = computed(() => {
  return category.value ? category.value.articles : []
})

const totalArticles = computed(() => {
  return category.value ? category.value.total_articles : 0
})

/** Query for fetching category data and articles. */
const { data: category, status: categoryStatus, suspense: categorySuspense, refetch: refetchCategory } = useQuery({
  queryKey: ['category_' + (route.params.category_path as string[]).join('/')],
  queryFn: async () => {
    let skip = 0
    let limit = 5
    if (page.value) {
      limit = page.value.ARTICLES_PER_PAGE
      skip = (page.value.currentPage - 1) * limit
    }
    const categoryPath = '/' + (route.params.category_path as string[]).join('/')
    return await categoryService.getCategory(categoryPath, true, limit, skip)
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