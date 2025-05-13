<template>
  <RouterLink :to="articleURL" class="flex items-center no-underline">
    <UIcon name="i-material-symbols-comment" class="mr-2" />
    <!-- Only underline the text, so the space between the icon is not underlined -->
    <span v-if="article.can_comment" class="hover:link">{{ article.comments_count }} comments
    </span>
  </RouterLink>
</template>

<script setup lang="ts">

const props = defineProps<{
  article: ArticlePreview,
}>();

const articleURL = computed(() => {
  return CMSUtils.resolveArticlePath(props.article.path) + '#comments'
})

</script>