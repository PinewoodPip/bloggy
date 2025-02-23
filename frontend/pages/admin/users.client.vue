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
import { useQuery } from '@tanstack/vue-query'

const userService = useUserService()

const searchTerm = ref("")

function addUser() {
  // TODO
}

/** Displayed users, after search filters */
const filteredUsers = computed(() => {
  if (searchTerm.value !== "") {
    let validUsers = users.value? [...users.value] : []
    // Search by username or display name, case-insensitive
    validUsers = validUsers.filter((user) => {
      return user.username.toLowerCase().includes(searchTerm.value) || (user.role === "editor" && user.display_name?.toLowerCase().includes(searchTerm.value))
    })
    return validUsers
  } else {
    return users.value
  }
})

/** Query for user list */
const { isPending: usersArePending, isError: usersHasError, data: users, error: usersError } = useQuery({
  queryKey: ["allUsers"],
  queryFn: async () => {
    return await userService.getAll()
  },
})

</script>