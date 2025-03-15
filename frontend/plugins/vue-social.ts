import Vue3SocialSharingPlugin from "vue3-social-sharing";
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxt) => {
  nuxt.vueApp.use(Vue3SocialSharingPlugin);
})