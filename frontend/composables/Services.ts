import UserService from "../services/user"

// Cached service instances;
// each composable only ever creates one of each service.
var userService: UserService|null = null

export const useUserService = () => {
  if (!userService) {
    const config = useRuntimeConfig()
    userService = new UserService(config.public.API_URL as string)
  }
  return userService
}
