<!-- Base component for published site pages; includes header, navigation bar and footer. -->
<template>
  <UContainer class="flexcol gap-y-5 items-center min-h-screen pt-5">
    <!-- TODO logo -->
    <div class="placeholder bg-base-300 w-80 h-32">
      <p>Logo</p>
    </div>

    <!-- TODO Navbar -->
    <nav class="navbar small-content-block place-content-center bg-base-200">
      <ul class="menu menu-horizontal place-content-center px-1 flex-grow">
        <li><RouterLink :to="'/'">Home</RouterLink></li>
        <li>
          <details>
            <summary>Some category</summary>
            <ul class="p-2">
              <li><a>Some subcategory</a></li>
              <li><a>Some subcategory 2</a></li>
            </ul>
          </details>
        </li>
        <li><a>Some other category</a></li>
        <li><a>About</a></li>
      </ul>

      <!-- TODO search -->
      <SiteSearchBar />
    </nav>

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

</script>