/**
 * Base service class, with wrappers for Axios methods.
 */
import axios, { Axios, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import Cookies from "js-cookie"
import qs from 'qs'

class Service {
  API_URL: string
  axios: Axios

  constructor(api_url: string) {
    this.API_URL = api_url
    this.axios = axios.create({
      baseURL: this.API_URL,
      headers: {
        'Content-type': 'application/json'
      }
    })
  }
  
  /** Sends a GET request. */
  protected get(route: string, params?: object): Promise<AxiosResponse<any, any>> {
    const options = this.getConfig()
    options.params = params
    // Allow a parameter to be provided multiple times (with different values)
    options.paramsSerializer = (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' })
    }
    return this.axios.get(route, options)
  }

  /** Sends a POST request. */
  protected post(route: string, payload?: any): Promise<AxiosResponse<any, any>> {
    return this.axios.post(route, payload, this.getConfig())
  }

  /** Sends an PATCH request. */
  protected patch(route: string, payload?: any): Promise<AxiosResponse<any, any>> {
    return this.axios.patch(route, payload, this.getConfig())
  }

  /** Sends a PUT request. */
  protected put(route: string, payload?: any): Promise<AxiosResponse<any, any>> {
    return this.axios.put(route, payload, this.getConfig())
  }
  
  /** Sends a DELETE request. */
  protected delete(route: string): Promise<AxiosResponse<any, any>> {
    return this.axios.delete(route, this.getConfig())
  }

  /** Returns the headers to use for requests */
  protected getConfig(): AxiosRequestConfig {
    if (!Cookies.get("auth_token")) {
      return {
        headers: {},
      };
    }
    return {
      headers: {
        Authorization: `Bearer ${Cookies.get("auth_token")}`,
      }
    };
  }
}

export default Service