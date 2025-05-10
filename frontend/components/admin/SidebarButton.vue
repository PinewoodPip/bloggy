<!-- 
  Navigation button for the admin panel sidebar.
  Highlighted based on current page.
-->
<template>
  <li class="min-w-full justify-start" :class="{ 'disabled': props.disabled }">
    <component :is="disabled ? 'a' : 'router-link'" :class="buttonHighlightClass(page)" :to="'/admin/' + page">
      <!-- Icon -->
      <UIcon :name="icon"></UIcon>

      <!-- Button label -->
      <slot/>
    </component>
  </li>
</template>

<script setup lang="ts">
const route = useRoute()

const props = defineProps<{
  page: string,
  icon: string,
  disabled?: boolean,
}>()

function isCurrentPage(page: string): boolean {
  return route.path === '/admin/' + page
}

function buttonHighlightClass(page: string) {
  const isActive = isCurrentPage(page)
  return { "active": isActive}
}

</script>