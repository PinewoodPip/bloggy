<template>
  <AdminPage header="Users" icon="i-heroicons-user" hint="Manage editor accounts.">
    <div class="flex py-3">
      <IconedInput v-model="searchTerm" icon="i-heroicons-magnifying-glass" placeholder="Search..."/>

      <HorizontalFill/>

      <!-- Only admins can create accounts -->
      <IconButton v-if="loggedInUser?.role === 'admin'" icon="i-heroicons-user-plus" class="btn-primary btn-sm" @click="addUser">Add editor</IconButton>
    </div>

    <FaintHr class="mb-2"/>

    <!-- Users list -->
    <div class="flex-grow overflow-x-auto">
      <div class="flexcol gap-y-1">
        <AdminUserListEntry v-for="user in filteredUsers" :user="user" :editable="loggedInUser?.role === 'admin' || user.username === loggedInUser?.username" @edit="editUser"/>
      </div>
    </div>
  </AdminPage>

  <!-- User creation & editing modals -->
  <UModal v-model="userCreationFormVisible" :overlay="true">
    <AdminUserCreationForm @create="onUserCreated" @close="userCreationFormVisible = false"/>
  </UModal>
  <UModal v-if="userToEdit" v-model="userEditFormVisible" :overlay="true">
    <AdminUserCreationForm :user-to-edit="userToEdit" @update="onUserEdited" @close="userEditFormVisible = false"/>
  </UModal>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'

const userService = useUserService()
const responseToast = useResponseToast()

const searchTerm = ref("")
const userCreationFormVisible = ref(false)
const userEditFormVisible = ref(false)
const userToEdit: Ref<User|null> = ref(null)
const { data: loggedInUser } = useLoggedInUser()

function addUser() {
  // Toggle creation modal
  userCreationFormVisible.value = true
}

function editUser(user: User) {
  userToEdit.value = user
  userEditFormVisible.value = true
}

function onUserCreated(user: User) {
  userCreationFormVisible.value = false // Close modal
  refetchUsers() // Update user list

  responseToast.showSuccess('User created', `Account for ${user.display_name} was created.`)
}

function onUserEdited(user: User) {
  userEditFormVisible.value = false // Close modal
  refetchUsers() // Update user list

  responseToast.showSuccess('User updated', `${user.display_name ? user.display_name : user.username}'s account information was updated.`)
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
// TODO display fetch errors
const { data: users, refetch: refetchUsers } = useQuery({
  queryKey: ["allUsers"],
  queryFn: async () => {
    return await userService.getAll()
  },
})

</script>