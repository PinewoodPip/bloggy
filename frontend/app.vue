<template>
  <UContainer>
    <NuxtPage/>
  </UContainer>
  <UNotifications />
</template>

<script setup lang="ts">

// Workaround for Nuxt UI color CSS variables conflicting with daisyUI ones
onNuxtReady(() => {
  // Remove Nuxt UI colors style node.
  // This contains only color variables, so the rest of the module's styiling is unaffected.
  window.document.head.querySelector("#nuxt-ui-colors")?.remove()
})

</script>