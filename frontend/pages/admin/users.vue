<template>
  <AdminPage>
    <div class="large-content-block flex-grow">
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

      <!-- Users list -->
      <div class="flex flex-col gap-y-2">
        <AdminUserListEntry v-for="user in users" :user="user"/>
      </div>
    </div>
  </AdminPage>
</template>

<script setup lang="ts">

const users = computed((): Array<User> => {
  // TODO integrate
  return [
    {username: "test", displayName: "test"},
    {username: "test2", displayName: "test2"},
    {username: "test3", displayName: "test3"},
  ]
})

function addUser() {
  // TODO
}

</script>