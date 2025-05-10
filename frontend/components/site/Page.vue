<!-- Base component for published site pages; includes header, navigation bar and footer. -->
<template>
  <UContainer class="flexcol gap-y-5 items-center min-h-screen pt-5">
    <figure class="placeholder bg-base-300 h-36 cursor-pointer">
      <RouterLink to="/">
        <img class="object-contain h-full" :src="logoPath" alt="Site logo" />
      </RouterLink>
    </figure>

    <!-- Navbar -->
    <SiteNavigationBar />

    <!-- Main -->
    <div class="flex gap-x-5 w-full">
      <!-- Page content -->
      <div class="flex-grow">
        <slot name="content" />
      </div>

      <!-- Sidebar -->
      <SiteSidebar v-if="showSidebar" />
    </div>
  </UContainer>

  <!-- Push footer to bottom of viewport -->
  <VerticalFill />

  <!-- TODO footer -->
  <!-- Temporary filler to add margin at bottom -->
  <div class="my-5" />
</template>

<script setup lang="ts">

const runtimeConfig = useRuntimeConfig()

const { title, showSidebar = true } = defineProps<{
  title: string,
  showSidebar?: boolean,
}>()

const logoPath = computed(() => {
  return runtimeConfig.public.apiUrl + 'site/logo'
})

useHead({
  title: computed(() => title),
})

</script>