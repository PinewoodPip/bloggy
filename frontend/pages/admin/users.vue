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
        <HorizontalFill/>
        <IconButton icon="i-heroicons-user-plus" class="btn-primary" @click="addUser">Add editor</IconButton>
      </div>

      <hr/>

      <!-- Users list -->
      <div class="flex-grow overflow-x-auto">
        <div class="flexcol gap-y-2">
          <AdminUserListEntry v-for="user in users" :user="user"/>
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

onMounted(() => {
  userService.getAll().then((resp) => {
    users.value = resp
  }).catch((e) => {
    // TODO
  })
})

function addUser() {
  // TODO
}

</script>