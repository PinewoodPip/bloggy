/**
 * Utility methods for /users/ API routes and auth handling.
 */
import Service from "./service"
import Cookies from "js-cookie"

class UserService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Sends a login request and stores the auth token and username if successful */
  async login(username: string, password: string) {
    try {
      const response = await this.post("/users/login", {
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
      const response = await this.post("/users/logout");

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
  async getUser(username: string): Promise<User> {
    try {
      const response = await this.get("/users/" + username);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /** Fetches all user accounts. Requires auth. */
  async getAll(): Promise<User[]> {
    try {
      const response = await this.get("/users/");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /** Creates an editor account. */
  async createUser(userData: UserCreationRequest): Promise<User> {
    try {
      const response = await this.post("/users/", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /** Updates a user's data. */
  async updateUser(username:string, userData: UserUpdateRequest): Promise<User> {
    try {
      const response = await this.patch("/users/" + username, userData);
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
  getCurrentUsername(): string|null {
    return this.isLoggedIn() ? Cookies.get("username") as string : null // isLoggedIn() tests for both cookies as sanity check.
  }
}

export default UserService
