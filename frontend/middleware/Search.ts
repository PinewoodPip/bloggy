
/** Redirect to home if no search params are provided. */
export default defineNuxtRouteMiddleware((to, from) => {
  const route = useRoute()
  const query = route.query
  if (!query.tag && !query.text && !query.author) {
    return navigateTo('/')
  }
})
