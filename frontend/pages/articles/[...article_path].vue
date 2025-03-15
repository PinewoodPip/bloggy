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

          <hr class="faint-hr mb-2" />

          <!-- Article footer -->
          <div class="flexcol gap-y-2">
            <p>Posted in <RouterLink class="link link-neutral" :to="'/categories' + article.category_path">{{ article.category.name }}</RouterLink></p>

            <!-- Tags -->
            <div class="flex flex-grow gap-x-2 flex-wrap">
              <SiteArticleTag v-for="tag in tags" :tag="tag" />
            </div>

            <!-- Author cards -->
            <!-- TODO show all authors -->
            <div v-if="author" class="card bg-base-100 w-fit shadow-sm p-3">
              <div class="flex items-center gap-x-2">
                <!-- Avatar -->
                <AvatarIcon class="size-24" />

                <!-- Name, bio and call to action -->
                <div class="flexcol gap-y-1">
                  <p class="text-lg">{{ author.display_name }}</p>
                  <p>{{ author.biography }}</p>
                  <div class="card-actions">
                    <button class="btn btn-sm btn-primary">View articles</button>
                  </div>
                </div>
              </div>
            </div>

            <hr class="faint-hr" />

            <!-- TODO share buttons -->
            <p>Share this article</p>
            <div class="flex gap-2 flex-wrap">
              <share-network v-for="network in socialNetworks" :network="network.name.toLowerCase()" :url="socialMediaSharingURL" v-slot="{ share }">
                <UTooltip :text="`Share on ${network.name}`">
                  <IconButton class="btn-secondary btn-sm" :icon="network.icon" @click="share">{{ network.name }}</IconButton>
                </UTooltip>
              </share-network>
            </div>
          </div>
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

const author = computed(() => {
  return article.value?.authors[0]
})

const tags = computed(() => {
  return ['test-tag', 'test-tag-2', 'test-tag-3'] // TODO
})

const socialMediaSharingURL = computed(() => {
  return window.location.href // TODO remove anchor
})

const socialNetworks = computed(() => {
  // TODO fetch from site settings
  const networks: {name: string, icon: string}[] = [
    {name: "Facebook", icon: "i-la-facebook"},
    {name: "X", icon: "i-la-twitter"}, // TODO new icon
    {name: "Tumblr", icon: "i-la-tumblr"},
    {name: "Reddit", icon: "i-la-reddit"},
    {name: "Pinterest", icon: "i-la-pinterest"},
    {name: "VK", icon: "i-la-vk"},
    {name: "Weibo", icon: "i-la-weibo"},
    {name: "Wordpress", icon: "i-la-wordpress"},
    {name: "Baidu", icon: "i-la-baidu"}, // TODO icon
    {name: "LinkedIn", icon: "i-la-linkedin"},
  ]
  return networks
})

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