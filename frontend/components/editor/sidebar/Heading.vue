<!-- Sidebar heading item. -->
<template>
  <!-- Event must not bubble, otherwise only top-level headings would be selected. -->
  <li @click.stop="onHeadingSelected">
    <details v-if="heading.subheadings.length > 0" open>
      <summary>{{ heading.name }}</summary>
      <ul>
        <Heading v-for="subheading in heading.subheadings" :heading="subheading" />
      </ul>
    </details>
    <span v-else>
      {{ heading.name }}
    </span>
  </li>
</template>

<script setup lang="ts">
import type { Callbacks, Heading } from './Sidebar.vue';

const callbacks = inject<Callbacks>('callbacks')

const props = defineProps<{
  heading: Heading,
}>();

function onHeadingSelected() {
  console.log('cli')
  callbacks?.selectHeading(props.heading)
}

</script>