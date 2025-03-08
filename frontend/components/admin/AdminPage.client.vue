<template>
  <div class="flexcol bg-base-100 h-screen p-5">

    <!-- Main -->
    <div class="flex gap-x-3 h-full">
      <!-- Sidebar -->
      <AdminSidebar class="h-100" />

      <div class="large-content-block flexcol flex-grow h-full">
        <!-- Header -->
        <div class="flex justify-between">
          <h2>
            <UIcon :name="icon" /> {{ header }}
          </h2>
          <p>{{ hint }}</p>
        </div>

        <hr />

        <!-- Content -->
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  icon: string,
  header: string,
  hint: string,
}>()

</script>