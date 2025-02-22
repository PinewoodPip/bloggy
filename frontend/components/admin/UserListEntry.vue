<template>
  <div class="flex content-center hover:bg-secondary/50 rounded-btn">
    <!-- Avatar TODO -->
    <div class="avatar placeholder size-8 mr-2">
      <div class="bg-neutral text-neutral-content w-full rounded-full">
        <p>U</p>
      </div>
    </div>

    <span>{{ user.displayName }}</span>
    <span class="italic">({{ user.username }})</span>

    <div class="mx-auto"/>

    <!-- Management buttons -->
    <div class="flex gap-x-2">
      <IconButton icon="i-heroicons-book-open" class="btn-secondary" @click="showArticles">View articles</IconButton>
      <IconButton icon="i-heroicons-pencil" class="btn-secondary" @click="editAccount">Edit account</IconButton>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  user: User,
}>()

function showArticles() {
  // TODO
}

function editAccount() {
  // TODO
}

</script>