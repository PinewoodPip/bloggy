import vue3GoogleLogin from 'vue3-google-login'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxt) => {
  const config = useRuntimeConfig()
  if (import.meta.client) {
    nuxt.vueApp.use(vue3GoogleLogin, {
      clientId: config.public.googleClientUrl,
    });
  }
})