<!-- Displays article metadata as a card. -->
<template>
  <div class="card bg-base-100 w-96 shadow-xl">
    <!-- Cover image -->
    <figure v-if="article.featured_image_path" class="max-h-48 -mb-4">
      <img :src="coverImageURL" alt="Cover image" />
    </figure>
    <div class="card-body">
      <!-- Title -->
      <h2 class="card-title ">
        <RouterLink :to="articleURL">{{ article.title }}</RouterLink>
      </h2>
      
      <!-- Author and date -->
      <SiteArticleMetadataSubtitle :article="article" :show-category="false" /> <!-- Showing category would be too verbose -->

      <FaintHr class="faint-hr" />

      <!-- Summary -->
      <p class="min-h-16">{{ article.summary }}</p>
      
      <FaintHr class="faint-hr" />

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

const coverImageURL = computed(() => {
  return CMSUtils.resolveFilePath(props.article.featured_image_path)
})

</script>