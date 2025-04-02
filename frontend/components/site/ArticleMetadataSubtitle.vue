<template>
  <!-- TODO list all authors -->
  <span class="flex gap-x-1">Posted by
    <!-- Avatar and name, linking to a filter search -->
    <RouterLink :to="authorSearchURL">
      <span class="flex items-center">
        <AvatarIcon class="size-4 mr-1"/>
        <span class="underline">
          {{ article.authors[0].display_name }}
        </span>
      </span>
    </RouterLink>
    <!-- Date -->
    <span v-if="articleDate">
      on {{ articleDate }}
    </span>
    <!-- Category -->
    <span v-if="showCategory">
      in <StyledLink :to="categoryLink">{{ categoryLabel }}</StyledLink>
    </span>
  </span>
</template>

<script setup lang="ts">

const props = defineProps<{
  article: ArticlePreview,
  showCategory?: boolean,
}>()

const categoryLink = computed(() => {
  return '/categories' + props.article.category_path
})

const categoryLabel = computed(() => {
  return props.article.category_name
})

const authorSearchURL = computed(() => {
  return '/search?author=' + props.article.authors[0].display_name // TODO support multiple
})

const articleDate = computed(() => {
  const date = props.article.publish_time
  if (date) {
    return new Date(date).toDateString() // TODO prettify
  } else {
    return null
  }
})

</script>