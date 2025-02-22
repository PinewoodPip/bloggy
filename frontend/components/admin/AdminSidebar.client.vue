<template>
  <div class="large-content-block flexcol gap-y-1 max-w-sm h-full">    
    <h1>{{ siteName }} control panel</h1>

    <!-- Section links -->
    <div class="flexcol gap-y-2 overflow-y-auto">
      <RouterLink to="/admin/content">
        <IconButton icon="i-heroicons-book-open" :class="buttonHighlightClass('content')" class="min-w-full">Content</IconButton>
      </RouterLink>
      <RouterLink to="/admin/users">
        <IconButton icon="i-heroicons-user" :class="buttonHighlightClass('users')" class="min-w-full">Users</IconButton>
      </RouterLink>
      <RouterLink to="/admin/events">
        <IconButton icon="i-heroicons-calendar" :class="buttonHighlightClass('events')" class="min-w-full">Events</IconButton>
      </RouterLink>
      <RouterLink to="/admin/config">
        <IconButton icon="i-heroicons-cog-6-tooth" :class="buttonHighlightClass('config')" class="min-w-full">Configuration</IconButton>
      </RouterLink>
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
import { useQuery } from '@tanstack/vue-query'

const route = useRoute()
const router = useRouter()
const userService = useUserService()

function logout() {
  userService.logout().then(() => {
    router.push("/admin/login") // TODO change to home once we have it
  }).catch(() => {
    // TODO
  })
}

function buttonHighlightClass(page: string) {
  const isHighlighted = isCurrentPage(page)
  return { "btn-secondary": isHighlighted, "btn-primary": !isHighlighted }
}

function isCurrentPage(page: string): boolean {
  return route.path === '/admin/' + page
}

const siteName = computed((): string => {
  return "TODO"
})

const { isPending: userIsPending, isError: userIsError, data: user, error: userError } = useQuery({
  queryKey: ["user"],
  queryFn: async () => {
    const currentUsername = userService.getCurrentUsername()
    // return await userService.getUser("pip12345")
    console.log(currentUsername)
    return currentUsername ? await userService.getUser(currentUsername) : null
  },
})

</script>
