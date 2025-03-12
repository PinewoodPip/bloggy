<!-- An article tag badge, linking to a tag-based search. -->
<template>
  <div class="badge badge-md bg-secondary hover:bg-secondary/80">
    <RouterLink :to="tagSearchURL">
      #{{ tag }}
    </RouterLink>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  tag: string,
}>()

const tagSearchURL = computed(() => {
  return `/search?tag=${props.tag}`
})

</script>