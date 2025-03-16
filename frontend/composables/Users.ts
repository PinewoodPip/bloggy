/**
 * User-related queries.
 */
import { useQuery, type UseQueryReturnType } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

const userService = useUserService()
const responseToast = useResponseToast()
const router = useRouter()

/**
 * Query to get the user data of the authenticated user.
 * Will redirect to login page if the credentials are found to have expired.
 */
export const useLoggedInUser = () => {
  const query = useQuery({
    queryKey: ["loggedInUser"],
    queryFn: async () => {
      const currentUsername = userService.getCurrentUsername()
      return currentUsername ? await userService.getUser(currentUsername) : null
    },
    retry: (count, err) => {
      if ((err as AxiosError).status === 401) {
        // Redirect back to home if the article URL is invalid
        responseToast.showWarning('Credentials expired. Please log in again.')
        userService.clearAuth()
        router.push('/admin/login') 
      }
      return false
    }
  })
  return query
}

/** A query that fetches all editor accounts. */
export const useEditors = () => {
  const query = useQuery({
    queryKey: ['editor'],
    queryFn: async () => {
      return await userService.getAll('editor')
    },
  })
  return query
}