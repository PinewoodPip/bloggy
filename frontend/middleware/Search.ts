
/** Redirect to home if no search params are provided. */
export default defineNuxtRouteMiddleware((to, from) => {
  const query = to.query
  if (!query.tag && !query.text && !query.author) {
    return navigateTo('/')
  }
})
