<template>
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
</template>

<script setup lang="ts">

const props = defineProps<{
  article: ArticlePreview,
}>()

const articleDate = computed(() => {
  const date = props.article.publish_time
  if (date) {
    return new Date(date).toDateString() // TODO prettify
  } else {
    return null
  }
})

</script>