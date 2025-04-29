<!-- Article summary view used in pagination. -->
<template>
  <article class="card card-border bg-base-200 shadow-md flex-grow">
    <div class="card-body p-4"> <!-- Default card padding is 2x larger, way too large -->
      <h2 class="card-title link">
        <RouterLink :to="articleURL">{{ article.title }}</RouterLink>
      </h2>
      <SiteArticleMetadataSubtitle :article="article" :show-category="true" />
      
      <hr class="faint-hr" />

      <!-- Summary -->
      <p class="min-h-16">{{ article.summary }}</p>

      <hr class="faint-hr" />

      <!-- Tags TODO -->
      <div class="flex items-center">
        <div class="flex flex-grow gap-x-2 flex-wrap">
          <SiteArticleTag v-for="tag in tags" :tag="tag" />
        </div>
        <!-- Comments counter -->
        <div>
          <SiteArticleCommentsCounter :article="article"/>
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
  return CMSUtils.resolveArticlePath(props.article.path)
})

const tags = computed(() => {
  return props.article.tags
})

</script>