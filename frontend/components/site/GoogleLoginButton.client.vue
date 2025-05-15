<!-- Wrapper for vue3-google-login component. -->
<template>
  <GoogleLogin v-if="!user.data.value && !isLoggingIn" :callback="onGoogleLogin" />
  <LoadingSpinner v-else-if="isLoggingIn" />
</template>

<script setup lang="ts">
import { GoogleLogin } from 'vue3-google-login'

const user = useLoggedInUser()
const isLoggingIn = ref(false)

type GoogleLoginResponse = {
  /** JWT token. */
  credential: string,
}

const userService = useUserService()

/** Stores token and forwards log-in to the backend. */
function onGoogleLogin(response: GoogleLoginResponse) {
  userService.googleLogin(response.credential)
  isLoggingIn.value = true

  setTimeout(() => {
    // Refresh user data and components that use it
    // Uses a timeout to compensate for the server clock being possibly slightly out of sync with google's (leading to the issued token not being valid yet)
    user.refetch().then(() => {
      isLoggingIn.value = false
    })
  }, 2000);
}

</script>