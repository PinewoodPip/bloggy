<template>
  <div class="flexcol p-4">
    <!-- Header -->
    <div class="flex content-center pb-2">
      <h2>Create user</h2>
      <HorizontalFill/>
      <!-- TODO confirm to close -->
      <button class="btn btn-sm btn-error aspect-square" @click="emit('close')"><UIcon name="i-heroicons-x-mark"/></button>
    </div>
    
    <hr/>

    <!-- Form -->
    <div class="flexcol gap-y-2 py-3">
      <!-- TODO avatar -->
      <div class="avatar placeholder size-24 mx-auto">
        <div class="bg-neutral text-neutral-content w-full rounded-full">
          <span class="text-3xl">P</span>
        </div>
      </div>

      <!-- Form fields -->
      <UFormGroup label="Username" help="Should be 8+ characters long">
        <UInput v-model="username" placeholder="username" icon="i-heroicons-user" required />
      </UFormGroup>
      <UFormGroup label="Password" help="Should be 8+ characters, with at least 1 digit and special character" :error="passwordError">
        <UInput v-model="password" type="password" placeholder="" icon="i-heroicons-hashtag" required />
      </UFormGroup>
      <UFormGroup label="Repeat password" :error="passwordConfirmationError">
        <UInput v-model="passwordConfirmation" type="password" placeholder="" icon="i-heroicons-hashtag" required />
      </UFormGroup>
      <UFormGroup label="Display name">
        <UInput v-model="displayName" placeholder="Mr. User" icon="i-heroicons-user" required />
      </UFormGroup>
    </div>

    <hr/>

    <!-- Footer -->
    <div class="flex justify-center pt-4">
      <IconButton icon="i-heroicons-user-plus" class="btn-primary" @click="createAccount" :disabled="!canCreate || createUserIsPending">
        <span>
          <!-- Show loading spinner while posting -->
          <span v-if="createUserIsPending" class="loading loading-spinner"/>
          <span v-else>Create account</span>
        </span>
      </IconButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

const errorStringifier = useResponseStringifier()
const userService = useUserService()
const toast = useToast()

const MINIMUM_PASSWORD_LENGTH = 8 // Should be same as in backend

const emit = defineEmits<{
  create: [user: User],
  close: [],
}>()

const username = ref("")
const password = ref("")
const passwordConfirmation = ref("")
const displayName = ref("")
const biography = ref("")

/** Sends a POST to create the user */
function createAccount() {
  requestCreateAccount({
    username: username.value,
    password: password.value,
    display_name: displayName.value,
    biography: biography.value !== "" ? biography.value : undefined,
  })
}

/** Whether the form is valid and can be submitted. */
const canCreate = computed(() => {
  return username.value !== "" && passwordError.value !== "" && passwordConfirmationError.value === "" && displayName.value !== ""
})

/** Checks whether the password field is valid according to backend requirements. */
const passwordIsValid = computed(() => {
  const pw = password.value
  return pw.length >= MINIMUM_PASSWORD_LENGTH && pw.search("\d") !== -1 && pw.search("[^\d\w]") !== -1 // Must have enough characters, at least one digit and at least one special character
})

/** Error label for password field */
const passwordError = computed(() => {
  return (passwordIsValid.value || password.value === "") ? "" : "Should be 8+ characters, with at least 1 digit and special character" // TODO show only info on the aspects that fail
})

/** Error label for password confirmation field. */
const passwordConfirmationError = computed(() => {
  const passwordsMatch = password.value === passwordConfirmation.value
  return (passwordsMatch || password.value === "" || passwordConfirmation.value === "") ? "" : "Passwords do not match"
})

/** Query for creating users */
const { isPending: createUserIsPending, mutate: requestCreateAccount } = useMutation({
  mutationFn: (newUser: UserCreationRequest) => {
    return userService.createUser(newUser)
  },
  onSuccess: (user) => {
    emit("create", user)
  },
  onError: (err) => {
    toast.add({title: "Failed to create user", description: errorStringifier.stringify(err as AxiosError), color: "red"})
  }
})

defineShortcuts({
  // Enter key submits the form
  enter: {
    usingInput: true,
    whenever: [canCreate],
    handler: () => {
      createAccount()
    },
  }
})

</script>