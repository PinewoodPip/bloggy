
export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return // Don't run this middleware on server
  const userService = useUserService()
  const isStaff = userService.isLoggedIn() && !userService.isReader()
  
  // Redirect to login page if accessing admin panel while not logged in
  if (to.path.startsWith("/admin") && !to.path.endsWith("login") && !isStaff) {
    return navigateTo("/admin/login")
  }
  // Redirect to panel if accessing login page while already logged in
  if (to.path.startsWith("/admin/login") && isStaff) {
    return navigateTo("/admin/users")
  }
})
