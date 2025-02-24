/**
 * Utility to stringify Axios responses and error
 * into more user-friendly formats for use within UI (ex. toasts).
 */
import type { AxiosError, AxiosResponse } from "axios";

class ResponseStringifier {
  stringify(error: AxiosError): string {    
    console.log(error) // For debugging fields, TODO remove

    // Stringify all validation errors
    if (error.response) {
      const response: AxiosResponse = error.response

      if (error.status == 422) {
        let validationErrors = []
        for (let errIndex in response.data.detail) {
          const err = response.data.detail[errIndex]
          const msg: string = err.msg
          validationErrors.push(msg.replace("Value error,", ""))
        }
        return validationErrors.join("; ") // Semicolon as divider creates the most readable results
      } else if (error.status == 400) {
        return response.data.detail
      } else if (error.status == 401) {
        const detail = response.data.detail
        return detail === 'Invalid token' ? 'Credentials expired; try logging in again' : detail // Make invalid token message a bit more user-friendly
      }
    }

    return "Unknown error"
  }
}

export const useResponseStringifier = () => {
  const stringifier = new ResponseStringifier();
  return stringifier
}
