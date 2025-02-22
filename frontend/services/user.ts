/**
 * Utility methods for /users/ API routes and auth handling.
 */
import axios, { Axios } from 'axios'
import Cookies from "js-cookie"

class UserService {
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

  /** Sends a login request and stores the auth token and username if successful */
  async login(username: string, password: string) {
    try {
      const response = await this.axios.post("/users/login", {
        "username": username,
        "password": password,
      });

      const data = response.data;
      const token = data.token;
      if (!token) {
        throw new Error("Token not found in the response?");
      }

      // Set auth cookies
      Cookies.set("auth_token", token, { expires: 3 });
      Cookies.set("username", username, { expires: 3 });

      return response;
    } catch (error) {
      throw error;
    }
  }

  /** Sends a logout request and clears auth cookies if successful */
  async logout() {
    try {
      const response = await this.axios.post("/users/logout", {}, this.getConfig());

      this.clearAuth()

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /** Removes auth cookies */
  clearAuth() {
    Cookies.remove("auth_token");
    Cookies.remove("username");
  }

  /** Fetches a user account */
  async get(username: string) {
    try {
      const response = await this.axios.get("/users/" + username);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /** Fetches all user accounts. Requires auth. */
  async getAll(): Promise<User[]> {
    try {
      const response = await this.axios.get("/users/", this.getConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /** Returns whether auth cookies are present. Does not validate them. */
  isLoggedIn() {
    return (Cookies.get("auth_token") !== undefined) && (Cookies.get("username") !== undefined) // Checks both cookies for coherency.
  }

  /** Returns the username of the current session, or null if the client is not logged in. */
  getCurrentUsername() {
    return this.isLoggedIn() ? Cookies.get("username") : null // isLoggedIn() tests for both cookies as sanity check.
  }

  /** Returns the headers to use for requests */
  getConfig() {
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

export default UserService
