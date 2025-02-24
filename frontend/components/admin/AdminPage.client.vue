<template>
  <div class="flexcol bg-base-100 h-screen p-5">

    <!-- Main -->
    <div class="flex gap-x-3 h-full">
      <!-- Sidebar -->
      <AdminSidebar class="h-100" />

      <!-- Content -->
      <slot/>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>