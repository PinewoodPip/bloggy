<!-- Page layout for paginated articles. -->
<template>
  <SitePage :title="title">
    <template #content>
      <div ref="contentTop" class="flexcol">
        <div class="flexcol gap-y-3">
          <!-- Top panel -->
          <div class="large-content-block">
            <!-- Breadcrumb navigation -->
            <SiteBreadcrumbs />

            <!-- Page description panel -->
            <slot name="pageDescription" />
          </div>

          <!-- Articles -->
          <div v-if="articleViewMode === 'vertical'" class="flexcol gap-y-3">
            <SiteArticlePreview v-for="article in articles" :article="article" />
          </div>
          <div v-if="articleViewMode === 'grid'" class="flex justify-around flex-wrap gap-4">
            <SiteArticleCard v-for="article in articles" :article="article" />
          </div>
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

const contentTopRef = useTemplateRef('contentTop')

/** Max dedicated buttons to jump to adjacent pages */
const ARTICLES_PER_PAGE = 5
const MAX_NEIGHBOUR_PAGE_BUTTONS = 3

const props = defineProps<{
  /** Page tab/head title. */
  title: string,
  articles: ArticlePreview[],
  totalArticles: integer,
  articleViewMode: categoryViewMode,
}>();

const currentPage = ref(1)

const emit = defineEmits<{
  pageChange: [integer],
}>();

defineExpose({ ARTICLES_PER_PAGE, currentPage })

// Pagination getters
const totalPages = computed(() => {
  return (props.totalArticles > 0) ? Math.ceil(props.totalArticles / ARTICLES_PER_PAGE) : 1 // Avoid division by 0 for empty categories
})
const previousPageIndices = computed(() => {
  return Math.min(currentPage.value - 1, MAX_NEIGHBOUR_PAGE_BUTTONS) // Limit amount of buttons for going to previous pages
})
const nextPageIndices = computed(() => {
  return Math.min(totalPages.value - currentPage.value, MAX_NEIGHBOUR_PAGE_BUTTONS) // Limit amount of buttons for going to next pages
})

// Refetch articles and scroll back to the top when the page index changes
watch(currentPage, () => {
  emit('pageChange', currentPage.value)
  DOMUtils.scrollViewToElement(contentTopRef) // Scroll back to top
})

</script>