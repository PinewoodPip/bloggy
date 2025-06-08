<!-- An article tag badge, linking to a tag-based search. -->
<template>
  <div class="badge badge-md bg-secondary hover:bg-secondary/80 hover:underline text-secondary-content !h-[1.6rem]">
    <RouterLink v-if="!disableLink" :to="tagSearchURL">
      {{ prefix }}{{ tag }}
    </RouterLink>
    <span v-else>
      {{ prefix }}{{ tag }}
    </span>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  tag: string,
  disableLink?: boolean, // If true, the tag will not behave as a link
  hidePrefix?: boolean, // If true, the tag will not be prefixed with a #
}>()

const tagSearchURL = computed(() => {
  return `/search?tag=${props.tag}`
})

const prefix = computed(() => {
  return !props.hidePrefix ? '#' : ''
})

</script>