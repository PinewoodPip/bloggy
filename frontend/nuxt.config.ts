// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/test-utils/module", "@nuxtjs/color-mode", "nuxt-gtag"],
  css: ["~/assets/css/main.css"],
  colorMode: {
    preference: "light", // "System" doesn't really make sense for a blog; appearance should be consistent for all visitors
    dataValue: "theme", // Sets data-theme attribute in <html> tag
    classSuffix: "",
  },
  imports: {
    // Auto-import API response/request types from service classes
    dirs: ['services', 'composables/editors', 'composables/editor/plugins', 'composables/editor/viewmodel']
  },
  build: { transpile: ['emoji-mart-vue-fast'] }, // Necessary due to the way this component is imported
  // Expose env variables to vue components and compasables
  runtimeConfig: {
    public: {
      apiUrl: '',
      serverApiUrl: '',
      googleClientUrl: '',
    }
  },
  app: {
    head: {
      script: [{ hid: "google", src: "https://accounts.google.com/gsi/client", defer: true }],
    },
  },
  compatibilityDate: "2025-02-11",
})