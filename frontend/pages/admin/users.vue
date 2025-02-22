<template>
  <AdminPage>
    <div class="large-content-block flexcol flex-grow h-full">
      <!-- Header -->
      <div class="flex justify-between">
        <h2>
          <UIcon name="i-heroicons-user" /> Users
        </h2>
        <p>Manage editor accounts.</p>
      </div>

      <hr />

      <!-- TODO search bar -->
      <div class="flex py-3">
        <IconedInput v-model="searchTerm" icon="i-heroicons-magnifying-glass" placeholder="Search..."/>

        <HorizontalFill/>

        <IconButton icon="i-heroicons-user-plus" class="btn-primary btn-sm" @click="addUser">Add editor</IconButton>
      </div>

      <hr/>

      <!-- Users list -->
      <div class="flex-grow overflow-x-auto">
        <div class="flexcol gap-y-2">
          <AdminUserListEntry v-for="user in filteredUsers" :user="user"/>
        </div>
      </div>
    </div>
  </AdminPage>
</template>

<script setup lang="ts">
import UserService from "../../services/user"

const config = useRuntimeConfig()
const userService = new UserService(config.public.API_URL as string)

const users: Ref<User[]> = ref([])
const searchTerm = ref("")

function addUser() {
  // TODO
}

const filteredUsers = computed(() => {
  if (searchTerm.value !== "") {
    let validUsers = [...users.value]
    // Search by username or display name, case-insensitive
    validUsers = validUsers.filter((user) => {
      return user.username.toLowerCase().includes(searchTerm.value) || (user.role === "editor" && user.display_name.toLowerCase().includes(searchTerm.value))
    })
    return validUsers
  } else {
    return users.value
  }
})

onMounted(() => {
  // Fetch all users
  userService.getAll().then((resp) => {
    users.value = resp
  }).catch((e) => {
    // TODO
  })
})

</script>