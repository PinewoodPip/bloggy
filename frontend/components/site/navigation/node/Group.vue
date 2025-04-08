<!-- Component for a group of items in the navigation bar. -->
<template>
  <li>
    <details class="z-50" :open="hovered || forceOpen" @mouseover="onMouseEnter" @mouseout="onMouseLeave">
      <summary :class="forceOpen ? 'no-chevron' : ''">{{ node.name }}</summary>
      <ul class="p-2 details-dropdown">
        <component v-for="subnode in node.children" :is="navigationNodeComponentGetter(subnode).component" v-bind="navigationNodeComponentGetter(subnode).props" :force-open="true" />
      </ul>
    </details>
  </li>
</template>

<script setup lang="ts">
import type { NavigationNode, NavigationNodeGroup } from '~/services/site';

const navigationNodeComponentGetter = useNavigationNodeComponents()

const props = defineProps<{
  node: NavigationNodeGroup,
  forceOpen?: boolean,
}>();

const hovered = ref(false)

// Track hovered state
function onMouseEnter() {
  hovered.value = true
}
function onMouseLeave() {
  hovered.value = false
}

</script>

<style lang="css">

/* Removes excessive margin from first child to make it easier to hover without unhovering parent */
.details-dropdown {
  margin-top: 0 !important;
}

/* Hides the V chevron on summary/details elements */
.no-chevron::after {
  display: none !important;
}

</style>