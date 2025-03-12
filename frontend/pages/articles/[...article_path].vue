<template>
  <SitePage>
    <template #content>
      <!-- Article area -->
      <div v-if="article" class="flexcol">
        <!-- Article -->
        <div class="large-content-block">
          <!-- Breadcrumbs -->
          <SiteBreadcrumbs />

          <!-- Article header -->
          <h1>{{ article.title }}</h1>

          <!-- Metadata -->
          <SiteArticleMetadataSubtitle :article="article" />

          <!-- Article content -->
          <!-- Will switch from SSR view to client one once mounted -->
          <ProsemirrorAdapterProvider v-if="mounted">
            <EditorDocument :initial-content="article?.content" :readonly="true" />
          </ProsemirrorAdapterProvider>
          <MarkdownDocument v-else :content="article.content" />
        </div>
      </div>
    </template>
  </SitePage>
</template>

<script setup lang="ts">
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

const articleService = useArticleService()
const responseToast = useResponseToast()
const router = useRouter()
const route = useRoute()

const mounted = ref(false) // Used to switch from the server-rendered article to the fully-riched client-rendered one

onMounted(() => {
  mounted.value = true
})

/** Query for fetching the article */
const { data: article, status: articleStatus, suspense: articleSuspense } = useQuery({
  queryKey: ['article_' + (route.params.article_path as string[]).join("/")],
  queryFn: async () => {
    const articlePath = '/' + (route.params.article_path as string[]).join("/")
    return await articleService.getArticle(articlePath)
  },
  retry: (count, err) => {
    if ((err as AxiosError).status === 404) {
      // Redirect back to home if the article URL is invalid
      responseToast.showError('Article not found')
      router.push('/') 
    } else if (count == 1) { // Show error on first failed fetch
      responseToast.showError('Failed to load article', err)
    }
    return true
  }
})
await articleSuspense(); // Have the server wait for the request to resolve

</script>