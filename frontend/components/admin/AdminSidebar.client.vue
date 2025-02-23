<template>
  <div class="large-content-block flexcol gap-y-1 max-w-sm h-full">    
    <h1>{{ siteName }} control panel</h1>

    <!-- Section links -->
    <div class="flexcol gap-y-2 overflow-y-auto">
      <AdminSidebarButton icon="i-heroicons-book-open" page="content">Content</AdminSidebarButton>
      <AdminSidebarButton icon="i-heroicons-user" page="users">Users</AdminSidebarButton>
      <AdminSidebarButton icon="i-heroicons-calendar" page="events">Events</AdminSidebarButton>
      <AdminSidebarButton icon="i-heroicons-cog-6-tooth" page="config">Configuration</AdminSidebarButton>

      <!-- Theme picker. TODO remove later -->
      <div class="p-4 flex gap-4">
        <select class="select w-full max-w-xs" v-model="colorMode.preference">
          <option disabled selected>Theme</option>
          <option v-for="theme of themes" :key="theme">{{ theme }}</option>
        </select>
      </div>
    </div>

    <VerticalFill/>

    <!-- User info -->
    <hr/>
    <div class="flex p-2">
      <!-- TODO -->
      <div class="avatar placeholder size-24">
        <div class="bg-neutral text-neutral-content w-full rounded-full">
          <span class="text-3xl">P</span>
        </div>
      </div>
      <div class="flexcol p-2">
        <p>{{ user ? user.username : "..." }}</p>
        <p>{{ user ? (user.display_name || user.role) : "..." }}</p> <!-- TODO capitalize role -->
        <div class="flex justify-end gap-x-2 mt-2">
          <IconButton icon="i-heroicons-pencil" class="btn-secondary">Edit account</IconButton>
          <IconButton icon="i-heroicons-arrow-left-start-on-rectangle-20-solid" class="btn-secondary" @click="logout">Logout</IconButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { _themes as daisyThemes } from '#tailwind-config/daisyui'
import { useQuery } from '@tanstack/vue-query'

const router = useRouter()
const colorMode = useColorMode();
const userService = useUserService()

const themes = [
  "system", ...new Set(daisyThemes)
];

function logout() {
  userService.logout().then(() => {
    router.push("/admin/login") // TODO change to home once we have it
  }).catch(() => {
    // TODO
  })
}

const siteName = computed((): string => {
  return "TODO"
})

const { isPending: userIsPending, isError: userIsError, data: user, error: userError } = useQuery({
  queryKey: ["user"],
  queryFn: async () => {
    const currentUsername = userService.getCurrentUsername()
    return currentUsername ? await userService.getUser(currentUsername) : null
  },
})

</script>
