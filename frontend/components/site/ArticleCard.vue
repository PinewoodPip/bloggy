<!-- Displays article metadata as a card. -->
<template>
  <div class="card bg-base-100 w-96 shadow-xl">
    <figure>
      <!-- TODO featured image -->
      <!-- <img src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" alt="Shoes" /> -->
    </figure>
    <div class="card-body">
      <!-- Title -->
      <h2 class="card-title ">
        <RouterLink :to="articleURL">{{ article.title }}</RouterLink>
      </h2>
      
      <!-- Author and date -->
      <SiteArticleMetadataSubtitle :article="article" :show-category="false" /> <!-- Showing category would be too verbose -->

      <hr class="faint-hr" />

      <!-- Summary -->
      <p class="min-h-16">{{ article.summary }}</p>
      
      <hr class="faint-hr" />

      <!-- Tags -->
      <div class="card-actions items-center justify-end">
        <SiteArticleTag v-for="tag in article.tags" :tag="tag" />
        <SiteArticleCommentsCounter :article="article" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  article: ArticlePreview,
}>()

const articleURL = computed(() => {
  return CMSUtils.resolveArticlePath(props.article.path)
})

</script>