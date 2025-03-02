<template>
  <div class="flex content-center hover:bg-secondary/50 rounded-btn">
    <!-- Avatar TODO -->
    <AvatarIcon class="size-8 mr-2"/>

    <!-- Name displays; admins have no displayname, so display their role instead -->
    <span>{{ user.role === "editor" ? user.display_name : user.username }}</span>
    <span class="italic">({{ user.role === "editor" ? user.username : "admin" }})</span>

    <div class="mx-auto"/>

    <!-- Management buttons -->
    <div class="flex gap-x-2">
      <IconButton icon="i-heroicons-book-open" class="btn-secondary" @click="showArticles">View articles</IconButton>
      <IconButton v-if="editable" icon="i-heroicons-pencil" class="btn-secondary" @click="editAccount">Edit account</IconButton>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  user: User,
  editable: boolean,
}>()

const emit = defineEmits<{
  edit: [user: User],
}>()

function showArticles() {
  // TODO
}

function editAccount() {
  emit('edit', props.user)
}

</script>