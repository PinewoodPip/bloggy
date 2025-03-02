import { useQuery, type UseQueryReturnType } from '@tanstack/vue-query'

const userService = useUserService()

export const useLoggedInUser = () => {
  const query = useQuery({
    queryKey: ["loggedInUser"],
    queryFn: async () => {
      const currentUsername = userService.getCurrentUsername()
      return currentUsername ? await userService.getUser(currentUsername) : null
    },
  })
  return query
}