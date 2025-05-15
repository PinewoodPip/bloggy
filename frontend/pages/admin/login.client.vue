<template>
  <div class="flex min-w-screen min-h-screen">
    <UContainer class="large-content-block flexcol max-w-sm flex-grow mx-auto my-auto">
      <h1 class="text-center">Login</h1>

      <div class="flexcol items-center">
        <p>Log-in to the control panel.</p>
        <p>Lost? <RouterLink class="text-secondary-content link" to="/">Return to the site</RouterLink>.</p>
      </div>

      <!-- Form fields -->
      <div class="flexcol gap-y-2">
        <UFormGroup label="Username">
          <FormInputField v-model="username" placeholder="username" icon="i-heroicons-user" required />
        </UFormGroup>
        <UFormGroup label="Password">
          <FormInputField v-model="password" type="password" placeholder="" icon="i-heroicons-hashtag" required />
        </UFormGroup>
      </div>

      <IconButton icon="i-heroicons-arrow-left-on-rectangle" :disabled="!areFieldsFilledIn" class="btn-smp btn-primary mt-3" @click="login">Log-in</IconButton>
    </UContainer>

  </div>
</template>

<script setup lang="ts">
const userService = useUserService()
const router = useRouter()
const responseToast = useResponseToast()

const username = ref("")
const password = ref("")

const areFieldsFilledIn = computed(() => {
  return username.value !== "" && password.value !== "" // TODO validate requirements
})

function login() {
  userService.login(username.value, password.value).then(() => {
    responseToast.showSuccess('Logged in', `Welcome back ${userService.getCurrentUsername()}`)
    router.push("/admin/content") // Redirect to control panel
  }).catch((err) => {
    responseToast.showError('Failed to login', err)
  })
}

defineShortcuts({
  // Enter key logs-in
  enter: {
    usingInput: true,
    whenever: [areFieldsFilledIn],
    handler: () => {
      login()
    },
  }
})

</script>