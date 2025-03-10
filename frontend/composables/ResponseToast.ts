/**
 * Wrapper for useToast and useResponseStringifier for displaying toasts for API responses.
 */
import type { AxiosError } from 'axios'

export const useResponseToast = () => {
  const toast = useToast()
  const stringifier = useResponseStringifier()
  return {
    /** Displays a toast for a succesful operation. */
    showSuccess(title: string, description?: string) {
      toast.add({title: title, description: description, color: 'green'})
    },

    /** Displays a toast for a warning. */
    showWarning(title: string, description?: string) {
      toast.add({title: title, description: description, color: "yellow"})
    },

    /** Displays a toast for a failed operation. */
    showError(title: string, err?: object) {
      toast.add({title: title, description: err ? stringifier.stringify(err as AxiosError) : undefined, color: 'red'})
    },
  }
}