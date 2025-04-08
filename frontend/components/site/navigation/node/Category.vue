<!-- Component for a category link in the navigation bar. -->
<template>
  <li><RouterLink :to="link">{{ node.category.name }}</RouterLink></li>
</template>

<script setup lang="ts">
import type { NavigationCategory } from '~/services/site';

const props = defineProps<{
  node: NavigationCategory,
}>();

const link = computed(() => {
  return CMSUtils.resolveCategoryPath(props.node.category.path)
})

</script>