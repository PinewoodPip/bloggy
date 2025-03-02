
export default defineNuxtRouteMiddleware((to, from) => {
  const userService = useUserService()
  // Redirect to login page if accessing admin panel while not logged in
  if (to.path.startsWith("/admin") && !to.path.endsWith("login") && !userService.isLoggedIn()) {
    return navigateTo("/admin/login")
  }
  // Redirect to panel if accessing login page while already logged in
  if (to.path.startsWith("/admin/login") && userService.isLoggedIn()) {
    return navigateTo("/admin/users")
  }
})
