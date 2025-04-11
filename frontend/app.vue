<template>
  <NuxtPage/>
  <UNotifications />
</template>

<script setup lang="ts">
import { useFavicon } from '@vueuse/core'

const config = useSiteConfig()
const favicon = useFavicon()
const runtimeConfig = useRuntimeConfig()

// Workaround for Nuxt UI color CSS variables conflicting with daisyUI ones
onNuxtReady(() => {
  // Remove Nuxt UI colors style node.
  // This contains only color variables, so the rest of the module's styiling is unaffected.
  window.document.head.querySelector("#nuxt-ui-colors")?.remove()
  
  // Set theme if config is loaded before initialization
  if (config.data.value) {
    colorMode.preference = config.data.value.theme
  }
})

// Set favicon
onMounted(() => {
  favicon.value = runtimeConfig.public.apiUrl + 'site/favicon'
})

// Set theme when config loads
const colorMode = useColorMode()
watchEffect(() => {
  if (config.data.value) {
    colorMode.preference = config.data.value.theme
  }
})

</script>

<!-- Global CSS imports -->
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>