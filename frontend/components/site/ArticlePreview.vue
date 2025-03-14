<!-- Article summary view used in pagination. -->
<template>
  <div class="card card-border bg-base-300 shadow-sm flex-grow">
    <div class="card-body p-4"> <!-- Default card padding is 2x larger, way too large -->
      <h2 class="card-title link">
        <RouterLink :to="articleURL">{{ article.title }}</RouterLink>
      </h2>
      <SiteArticleMetadataSubtitle :article="article" />
      
      <hr class="faint-hr" />

      <!-- Summary -->
      <p class="min-h-16">TODO</p>

      <hr class="faint-hr" />

      <!-- Tags TODO -->
      <div class="flex">
        <div class="flex flex-grow gap-x-2 flex-wrap">
          <SiteArticleTag v-for="tag in tags" :tag="tag" />
        </div>
        <!-- Comments counter -->
        <div>
          <RouterLink :to="articleURL" class="no-underline">
            <Icon icon="comment" class="mr-2" />
            <!-- Only underline the text, so the space between the icon is not underlined -->
            <span class="link">TODO comments
            </span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  article: ArticlePreview,
}>()

const articleURL = computed(() => {
  return '/articles' + props.article.path + '#comments' // Path already includes leading slash
})

const tags = computed(() => {
  return ['test-tag', 'test-tag-2', 'test-tag-3']
})

</script>