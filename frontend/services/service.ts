/**
 * Base service class, with wrappers for Axios methods.
 */
import axios, { Axios, type AxiosResponse } from 'axios'
import Cookies from "js-cookie"

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
  protected get(route: string): Promise<AxiosResponse<any, any>> {
    return this.axios.get(route, this.getConfig())
  }

  /** Sends a POST request. */
  protected post(route: string, payload?: any): Promise<AxiosResponse<any, any>> {
    return this.axios.post(route, payload, this.getConfig())
  }

  /** Sends an PATCH request. */
  protected patch(route: string, payload?: any): Promise<AxiosResponse<any, any>> {
    return this.axios.patch(route, payload, this.getConfig())
  }

  /** Returns the headers to use for requests */
  protected getConfig() {
    if (!Cookies.get("auth_token")) {
      return {};
    }
    return {
      headers: {
        Authorization: `Bearer ${Cookies.get("auth_token")}`,
      }
    };
  }
}

export default Service