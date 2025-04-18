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
      <SiteSidebar />
    </div>
  </UContainer>

  <!-- Push footer to bottom of viewport -->
  <VerticalFill />
</template>

<script setup lang="ts">

const runtimeConfig = useRuntimeConfig()

const props = defineProps<{
  title: string,
}>()

const logoPath = computed(() => {
  return runtimeConfig.public.apiUrl + 'site/logo'
})

useHead({
  title: computed(() => props.title),
})

</script>