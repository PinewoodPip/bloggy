<!-- Wrapper for vue3-google-login component. -->
<template>
  <GoogleLogin :callback="onGoogleLogin" />
</template>

<script setup lang="ts">
import { GoogleLogin } from 'vue3-google-login'

type GoogleLoginResponse = {
  /** JWT token. */
  credential: string,
}

const userService = useUserService()

/** Stores token and forwards log-in to the backend. */
function onGoogleLogin(response: GoogleLoginResponse) {
  userService.googleLogin(response.credential)
}

</script>