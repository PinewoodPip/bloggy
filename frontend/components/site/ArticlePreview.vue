<!-- Article summary view used in pagination. -->
<template>
  <article class="card card-border bg-base-200 shadow-md flex-grow">
    <div class="card-body p-4"> <!-- Default card padding is 2x larger, way too large -->
      <h2 class="card-title link">
        <RouterLink :to="articleURL">{{ article.title }}</RouterLink>
      </h2>
      <SiteArticleMetadataSubtitle :article="article" />
      
      <hr class="faint-hr" />

      <!-- Summary -->
      <p class="min-h-16">{{ article.summary }}</p>

      <hr class="faint-hr" />

      <!-- Tags TODO -->
      <div class="flex">
        <div class="flex flex-grow gap-x-2 flex-wrap">
          <SiteArticleTag v-for="tag in tags" :tag="tag" />
        </div>
        <!-- Comments counter -->
        <div>
          <RouterLink :to="articleURL" class="no-underline">
            <UIcon name="i-material-symbols-comment" class="mr-2" />
            <!-- Only underline the text, so the space between the icon is not underlined -->
            <span class="link">TODO comments
            </span>
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">

const props = defineProps<{
  article: ArticlePreview,
}>()

const articleURL = computed(() => {
  return '/articles' + props.article.path + '#comments' // Path already includes leading slash
})

const tags = computed(() => {
  return props.article.tags
})

</script>