<!-- Shows breadcrumbs for the current page based on URL. -->
<template>
  <div class="breadcrumbs text-sm">
    <ul>
      <li v-for="crumb in navigationCrumbs">
        <RouterLink :to="crumb.url">{{ crumb.name }}</RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">

const route = useRoute()

const props = defineProps<{
  /** If present, takes priority over auto-generated crumbs from the URL. */
  crumbs?: {name: string, url: string}[],
}>()

/** Crumbs for the current path. */
const navigationCrumbs = computed(() => {
  if (props.crumbs) {
    return props.crumbs
  } else {
    // Auto-generate crumbs from URL
    const url = route.fullPath
    const crumbs: {name: string, url: string}[] = [
      {name: 'Home', url: '/'}, // Always show crumb back home
    ]
    const urlComponents = url.split('/').slice(1) // Ignore first empty string
    for (let i = 0; i < urlComponents.length; ++i) {
      const comp = urlComponents[i]
      let url = '/' + urlComponents.slice(0, i + 1).join('/') // Use URL up until this component
      if (i == urlComponents.length - 1) {
        url = url.replace(/#.+/, '') // Remove trailing queries
      }
      crumbs.push({
        name: comp, // TODO use category / article names instead
        url: url,
      })
    }
    return crumbs
  }
})

</script>