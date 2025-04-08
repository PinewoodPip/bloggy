<!-- Component for an external link in the navigation bar. -->
<template>
  <li><RouterLink :to="link">{{ node.title }}</RouterLink></li>
</template>

<script setup lang="ts">
import type { NavigationExternalLink } from '~/services/site';

const props = defineProps<{
  node: NavigationExternalLink,
}>();

const link = computed(() => {
  return props.node.url
})

</script>