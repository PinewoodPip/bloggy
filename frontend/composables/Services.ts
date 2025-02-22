import UserService from "../services/user"

export const useUserService = () => {
  const config = useRuntimeConfig()
  const stringifier = new UserService(config.public.API_URL as string)
  return stringifier
}
