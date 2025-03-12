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

const navigationCrumbs = computed(() => {
  const url = route.fullPath
  const crumbs: {name: string, url: string}[] = [
    {name: 'Home', url: '/'}, // Always show crumb back home
  ]
  const urlComponents = url.split('/').slice(1) // Ignore first empty string
  for (const i in urlComponents) {
    const comp = urlComponents[i]
    // TODO use category / article names instead
    crumbs.push({
      name: comp,
      // @ts-ignore Somehow, TS thinks i is a string here.
      url: '/' + urlComponents.slice(0, i + 1).join('/'), // Use URL up until this component
    })
  }
  return crumbs
})

</script>