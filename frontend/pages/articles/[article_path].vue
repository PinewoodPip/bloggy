<template>
  <UContainer class="flexcol gap-y-5 items-center min-h-screen pt-5">
    <!-- TODO logo -->
    <div class="placeholder bg-base-300 w-80 h-32">
      <p>Logo</p>
    </div>

    <!-- TODO Navbar -->
    <nav class="navbar bg-base-100 shadow-sm">
      <ul class="menu menu-horizontal px-1">
        <li><RouterLink :to="'/'">Home</RouterLink></li>
        <li>
          <details>
            <summary>Some category</summary>
            <ul class="p-2">
              <li><a>Some subcategory</a></li>
              <li><a>Some subcategory 2</a></li>
            </ul>
          </details>
        </li>
        <li><a>Some other category</a></li>
        <li><a>About</a></li>

        <!-- TODO search -->
        <IconedInput v-model="searchTerm" icon="i-heroicons-magnifying-glass" placeholder="Search..." />
      </ul>
    </nav>

    <!-- Content -->
    <div class="flex gap-x-5 w-full">

      <!-- Article area -->
      <div v-if="article" class="flexcol flex-grow">

        <!-- Article -->
        <div class="large-content-block">
          <!-- Breadcrumbs -->
          <div class="breadcrumbs text-sm">
            <ul>
              <li><a>Home</a></li>
              <li><a>Documents</a></li>
              <li>Add Document</li>
            </ul>
          </div>

          <!-- Article header -->
          <h1>{{ article.title }}</h1>
          <!-- Metadata -->
          <!-- TODO list all authors -->
          <span class="flex gap-x-1">Posted by
            <span class="flex items-center">
              <AvatarIcon class="size-4 mr-1"/>
              {{ article.authors[0].display_name }}
            </span>
            <span v-if="articleDate">
              on {{ articleDate }}
            </span>
          </span>

          <!-- Article content -->
          <!-- Will switch from SSR view to client one once mounted -->
          <ProsemirrorAdapterProvider v-if="mounted">
            <EditorDocument :initial-content="article?.content" :readonly="true" />
          </ProsemirrorAdapterProvider>
          <ProsemirrorAdapterProvider v-else>
            <EditorDocument :initial-content="article?.content" :readonly="true" />
          </ProsemirrorAdapterProvider>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="large-content-block w-lg">
        <h2>Sidebar</h2>
        <p>TODO</p>
      </div>
    </div>

    <VerticalFill />
  </UContainer>
  
  <!-- TODO footer -->
  <footer class="footer bg-base-200 text-base-content p-5">
    <nav>
      <h6 class="footer-title">Services</h6>
      <a class="link link-hover">Branding</a>
      <a class="link link-hover">Design</a>
      <a class="link link-hover">Marketing</a>
      <a class="link link-hover">Advertisement</a>
    </nav>
    <nav>
      <h6 class="footer-title">Company</h6>
      <a class="link link-hover">About us</a>
      <a class="link link-hover">Contact</a>
      <a class="link link-hover">Jobs</a>
      <a class="link link-hover">Press kit</a>
    </nav>
    <nav>
      <h6 class="footer-title">Legal</h6>
      <a class="link link-hover">Terms of use</a>
      <a class="link link-hover">Privacy policy</a>
      <a class="link link-hover">Cookie policy</a>
    </nav>
  </footer>
</template>

<script setup lang="ts">
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

const articleService = useArticleService()
const responseToast = useResponseToast()
const router = useRouter()
const route = useRoute()

const searchTerm = ref('')
const mounted = ref(false) // Used to switch from the server-rendered article to the fully-riched client-rendered one

const articleDate = computed(() => {
  const date = article.value?.publish_time
  if (date) {
    return new Date(date).toDateString() // TODO prettify
  } else {
    return null
  }
})

onMounted(() => {
  mounted.value = true
})

/** Query for fetching the article */
const { data: article, status: articleStatus, suspense: articleSuspense } = useQuery({
  queryKey: ['article'],
  queryFn: async () => {
    console.log('fetching')
    return await articleService.getArticle('/' + route.params.article_path)
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