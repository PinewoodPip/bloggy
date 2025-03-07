<template>
  <UContainer class="large-content-block flexcol max-w-md">
    <h1 class="text-center">Login</h1>
    <!-- TODO inform guests this is not the right login page for them -->

    <!-- Form fields -->
    <div class="flexcol gap-y-2">
      <UFormGroup label="Username">
        <InputField v-model="username" placeholder="username" icon="i-heroicons-user" required />
      </UFormGroup>
      <UFormGroup label="Password">
        <InputField v-model="password" type="password" placeholder="" icon="i-heroicons-hashtag" required />
      </UFormGroup>
    </div>

    <IconButton icon="i-heroicons-arrow-left-on-rectangle" :disabled="!areFieldsFilledIn" class="btn-primary mt-3" @click="login">Log-in</IconButton>
  </UContainer>
</template>

<script setup lang="ts">
import UserService from "../../services/user"

const config = useRuntimeConfig()
const userService = new UserService(config.public.API_URL as string)
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
    router.push("/admin/users") // Redirect to control panel
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