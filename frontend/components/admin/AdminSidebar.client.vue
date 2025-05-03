<template>
  <div class="large-content-block flexcol gap-y-1 max-w-sm h-full">    
    <h1>{{ siteName }} control panel</h1>

    <!-- Section links -->
    <div class="flexcol menu menu-bg-base-200 gap-y-1 p-0 overflow-y-auto">
      <AdminSidebarButton icon="i-heroicons-book-open" page="content">Content</AdminSidebarButton>
      <AdminSidebarButton icon="i-heroicons-user" page="users">Users</AdminSidebarButton>
      <AdminSidebarButton icon="material-symbols:image-outline" page="files">Files</AdminSidebarButton>
      <AdminSidebarButton icon="i-heroicons-calendar" page="events">Events</AdminSidebarButton>
      <AdminSidebarButton icon="material-symbols:assistant-navigation-outline" page="navigation">Navigation</AdminSidebarButton>
      <AdminSidebarButton icon="i-heroicons-cog-6-tooth" page="config">Configuration</AdminSidebarButton>
    </div>

    <VerticalFill/>

    <hr/>

    <!-- User info -->
    <div class="flex px-2 pt-2"> <!-- No bottom padding as the sidebar already has enough -->
      <UserAvatar v-if="user" class="size-24" :user="user" />
      <div class="flexcol p-2">
        <p>{{ user ? user.username : "..." }}</p>
        <p>{{ user ? (user.display_name || user.role) : "..." }}</p> <!-- TODO capitalize role -->
        <div class="flex justify-end gap-x-2 mt-2">
          <IconButton icon="i-heroicons-pencil" class="btn-smp btn-secondary" @click="editAccount">Edit account</IconButton>
          <IconButton icon="i-heroicons-arrow-left-start-on-rectangle-20-solid" class="btn-smp btn-secondary" @click="logout">Logout</IconButton>
        </div>
      </div>
    </div>
    
    <!-- User edit form modal -->
    <UModal v-if="user" v-model="accountEditFormVisible" :overlay="true">
      <AdminUserCreationForm :user-to-edit="user" @update="onUserEdited" @close="accountEditFormVisible = false"/>
    </UModal>
  </div>
</template>

<script setup lang="ts">

const router = useRouter()
const userService = useUserService()
const { data: user, refetch: refetchUser } = useLoggedInUser()
const siteConfig = useSiteConfig()
const responseToast = useResponseToast()

const accountEditFormVisible = ref(false)

/** Opens the account edit form. */
function editAccount() {
  accountEditFormVisible.value = true
}

/** Closes the session and exits of the admin panel. */
function logout() {
  userService.logout().then(() => {
    router.push("/")
  }).catch((err) => {
    responseToast.showError('Error while logging out', err)
  })
}

/** Reports success and refetches user info. */
function onUserEdited(user: User) {
  accountEditFormVisible.value = false // Close modal
  responseToast.showSuccess('User updated', 'Your account information was updated.')

  // If the username changed, the token is no longer valid and the user must log back in
  if (user.username !== userService.getCurrentUsername()) {
    responseToast.showWarning('Username updated', 'Your username was updated; please log back in.')
    userService.clearAuth()
    router.push('/admin/login')
  } else {
    refetchUser() // Update user info
  }
}

const siteName = computed((): string => {
  return siteConfig.data.value?.site_name || 'Bloggy'
})

</script>
