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
  
  <!-- TODO footer -->
  <footer class="footer bg-base-200 text-base-content p-5 mt-10">
    <nav>
      <h6 class="footer-title">Services</h6>
      <a class="link link-hover">Branding</a>
      <a class="link link-hover">Design</a>
      <a class="link link-hover">Marketing</a>
      <a class="link link-hover">Advertisement</a>
    </nav>
    <nav>
      <h6 class="footer-title">Company</h6>
      <a class="link link-hover">About us</a>
      <a class="link link-hover">Contact</a>
      <a class="link link-hover">Jobs</a>
      <a class="link link-hover">Press kit</a>
    </nav>
    <nav>
      <h6 class="footer-title">Legal</h6>
      <a class="link link-hover">Terms of use</a>
      <a class="link link-hover">Privacy policy</a>
      <a class="link link-hover">Cookie policy</a>
    </nav>
  </footer>
</template>

<script setup lang="ts">

const runtimeConfig = useRuntimeConfig()

const logoPath = computed(() => {
  return runtimeConfig.public.apiUrl + 'site/logo'
})

</script>