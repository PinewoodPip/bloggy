<template>
  <div class="flex items-center bg-secondary/20 hover:bg-secondary/50 rounded-btn p-2">
    <UserAvatar class="size-8 mr-2" :user="user" />

    <!-- Name displays; admins have no displayname, so display their role instead -->
    <span class="mr-1">{{ user.role === "editor" ? user.display_name : user.username }}</span>
    <span class="italic">({{ user.role === "editor" ? user.username : "admin" }})</span>

    <div class="mx-auto"/>

    <!-- Management buttons -->
    <div class="flex gap-x-2">
      <!-- Edit account -->
      <IconButton v-if="editable" icon="i-heroicons-pencil" class="btn-sm btn-secondary" @click="editAccount">Edit account</IconButton>

      <!-- View articles -->
      <IconButton v-if="isEditor" icon="i-heroicons-book-open" class="btn-sm btn-secondary" @click="showArticles">View articles</IconButton>
    </div>
  </div>
</template>

<script setup lang="ts">

const router = useRouter()

const props = defineProps<{
  user: User,
  editable: boolean,
}>()

const emit = defineEmits<{
  edit: [user: User],
}>()

function showArticles() {
  router.push(`/search?author=${props.user.display_name}`)
}

function editAccount() {
  emit('edit', props.user)
}

const isEditor = computed(() => {
  return props.user.role === 'editor'
})

</script>