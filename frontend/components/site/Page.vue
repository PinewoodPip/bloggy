<!-- Base component for published site pages; includes header, navigation bar and footer. -->
<template>
  <UContainer class="flexcol gap-y-5 items-center min-h-screen pt-5">
    <figure class="h-36 cursor-pointer">
      <RouterLink to="/">
        <img v-if="!logoLoadingFailed" class="object-contain h-full" :src="logoPath" @error="onLogoLoadingFailed" alt="Site logo" />
        <p class="text-xl" v-else>{{ siteConfig.data.value?.site_name }}</p> <!-- Display site name as fallback -->
      </RouterLink>
    </figure>

    <!-- Navbar -->
    <SiteNavigationBar :nodes="navigationBarNodes" :can-search="true" />

    <!-- Main -->
    <div class="flex gap-x-5 w-full">
      <!-- Page content -->
      <div class="flex-grow">
        <slot name="content" />
      </div>

      <!-- Sidebar -->
      <SiteSidebar v-if="showSidebar" class="max-h-fit sticky top-[1rem]" />
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
const siteConfig = useSiteConfig()
const navigation = useNavigationBar()

const logoLoadingFailed = ref(false)

const { title, showSidebar = true } = defineProps<{
  title: string,
  showSidebar?: boolean,
}>()

/** Sets a flag to display the site's name as a fallback instead of the logo. */
function onLogoLoadingFailed() {
  logoLoadingFailed.value = true
}

const logoPath = computed(() => {
  return runtimeConfig.public.apiUrl + 'site/logo'
})

const navigationBarNodes = computed(() => {
  return navigation.value.root_nodes
})

useHead({
  title: computed(() => title),
})

</script>