<!-- 
  Navigation button for the admin panel sidebar.
  Highlighted based on current page.
-->
<template>
  <RouterLink :to="'/admin/' + page">
    <IconButton :icon="icon" :class="buttonHighlightClass(page)" class="btn-smp min-w-full justify-start"><slot/></IconButton>
  </RouterLink>
</template>

<script setup lang="ts">
const route = useRoute()

const props = defineProps<{
  page: string,
  icon: string,
}>()

function isCurrentPage(page: string): boolean {
  return route.path === '/admin/' + page
}

function buttonHighlightClass(page: string) {
  const isActive = isCurrentPage(page)
  return { "btn-primary": isActive, "btn-secondary": !isActive }
}

</script>