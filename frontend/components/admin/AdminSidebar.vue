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
        <p>{{ username }}</p>
        <p>{{ accountRole }}</p>
        <div class="flex justify-end gap-x-2 mt-2">
          <IconButton icon="i-heroicons-pencil" class="btn-secondary">Edit account</IconButton>
          <IconButton icon="i-heroicons-arrow-left-start-on-rectangle-20-solid" class="btn-secondary">Logout</IconButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const route = useRoute()

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

const username = computed(() => {
  return "TODO"
})

const accountRole = computed(() => {
  return "TODO"
})

</script>
