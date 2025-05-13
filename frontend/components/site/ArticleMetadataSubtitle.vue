<template>
  <!-- TODO list all authors -->
  <span class="flex gap-x-1 text-base-content/90">Posted by
    <!-- Avatar and name, linking to a filter search -->
    <RouterLink :to="authorSearchURL">
      <span class="flex items-center">
        <UserAvatar class="size-4 mr-1" :user="article.authors[0]" />
        <span class="hover:underline">
          {{ article.authors[0].display_name }}
        </span>
      </span>
    </RouterLink>
    <!-- Date -->
    <span v-if="articleDate">
      on 
      <UTooltip :text="articleTimeLabel">
        {{ articleDate }}
      </UTooltip>
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

/** Short article date (day, month, year). */
const articleDate = computed(() => {
  const date = props.article.publish_time
  if (date) {
    return new Date(date).toDateString() // TODO prettify
  } else {
    return null
  }
})

/** Article time. */
const articleTimeLabel = computed(() => {
  const date = props.article.publish_time
  if (date) {
    return `at ${new Date(date).toLocaleTimeString()}`
  } else {
    return ''
  }
})

</script>