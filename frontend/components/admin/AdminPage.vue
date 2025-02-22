<template>
  <div class="flexcol">
    <h1>{{ siteName }} control panel</h1>

    <!-- Main -->
    <div class="flex gap-x-3">
      <!-- Sidebar -->
      <AdminSidebar />

      <!-- Content -->
      <slot class="flex-grow"/>
    </div>
  </div>
</template>

<script setup lang="ts">

const siteName = computed((): string => {
  return "TODO"
})

</script>