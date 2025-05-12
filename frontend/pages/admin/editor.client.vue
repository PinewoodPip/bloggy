<!-- Article editor page -->
<template>
  <ArticleEditor class="mt-2" @exit="onExplicitExit" />
</template>

<script setup lang="ts">

const isExitingExplicitly = ref(false)

// Track if the user is exiting the page explicitly to avoid bringing up the confirmation dialog
function onExplicitExit() {
  isExitingExplicitly.value = true
}

// Prompt for confirmation when closing the page
// Source: https://stackoverflow.com/a/78541804
const route = useRoute()
const router = useRouter()
router.beforeEach((to, from, next) => {
  // Do not show confirmation dialog if the user is explicitly leaving or in a development environment (since hot reload would also trigger it)
  if (from.fullPath === route.fullPath && !isExitingExplicitly.value && !import.meta.dev) {
    if (confirm('Are you sure you want to leave this page?')) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})
function beforeUnload(e: Event) {
  e.preventDefault()
}
onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnload)
})

</script>