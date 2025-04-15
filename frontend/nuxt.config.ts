// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/test-utils/module", "@nuxtjs/color-mode"],
  css: ["~/assets/css/main.css"],
  colorMode: {
    preference: "light", // "System" doesn't really make sense for a blog; appearance should be consistent for all visitors
    dataValue: "theme", // Sets data-theme attribute in <html> tag
    classSuffix: "",
  },
  imports: {
    // Auto-import API response/request types from service classes
    dirs: ['services']
  },
  // Expose env variables to vue components and compasables
  runtimeConfig: {
    public: {
      apiUrl: '',
      serverApiUrl: '',
    }
  },
  compatibilityDate: "2025-02-11"
})