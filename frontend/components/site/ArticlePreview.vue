<!-- Article summary view used in pagination. -->
<template>
  <article class="card card-side card-border bg-base-200 shadow-md flex-grow max-h-64">
    <!-- Cover image -->
    <figure v-if="article.featured_image_path" class="object-cover max-h-full m-4 mr-0 rounded-md">
      <RouterLink class="flex items-center !max-w-2xl" :to="articleURL">
        <img class="hover:opacity-80" :src="coverImageURL" alt="Cover image" />
      </RouterLink>
    </figure>
    <!-- Card content -->
    <div class="card-body p-4"> <!-- Default card padding is 2x larger, way too large -->
      <div class="flexcol">
        <h2 class="card-title hover:link">
          <RouterLink :to="articleURL">{{ article.title }}</RouterLink>
        </h2>
        <SiteArticleMetadataSubtitle :article="article" :show-category="true" />
      </div>
      
      <FaintHr class="faint-hr" />

      <!-- Summary -->
      <p class="min-h-16 overflow-ellipsis overflow-clip">{{ article.summary }}</p>

      <FaintHr class="faint-hr" />

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

const coverImageURL = computed(() => {
  return CMSUtils.resolveFilePath(props.article.featured_image_path)
})

</script>