<!-- Component for an article link in the navigation bar. -->
<template>
  <li><RouterLink :to="link">{{ node.article.title }}</RouterLink></li>
</template>

<script setup lang="ts">
import type { NavigationArticle, NavigationNode, NavigationNodeGroup } from '~/services/site';

const props = defineProps<{
  node: NavigationArticle,
}>();

const link = computed(() => {
  return CMSUtils.resolveArticlePath(props.node.article.path)
})

</script>