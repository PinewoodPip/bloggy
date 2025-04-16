/**
 * Utility methods for /users/ API routes and auth handling.
 */
import Service from "./service"
import Cookies from "js-cookie"

export type userRole = 'admin'|'editor'|'reader'

/** Schema for GET /users/{username} responses. */
export type User = {
  username: string,
  role: userRole,

  // Following fields only present for editor accounts
  display_name?: string, 
  contact_email?: string,
  biography?: string,
}

/** Schema for POST /users/ requests. */
export type UserCreationRequest = {
  username: string,
  password: string,
  display_name: string,
  biography?: string,
  contact_email?: string,
}

/** Schema for PATCH /users/ */
export type UserUpdateRequest = {
username?: string,
password?: string,
display_name?: string,
biography?: string,
contact_email?: string|null,
}

interface AuthTokenPayload {
  /** The username of the token bearer. */
  sub: string,
  expires: integer,
}

class UserService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Sends a login request and stores the auth token and username if successful */
  async login(username: string, password: string) {
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

    return response;
  }

  /** Sends a logout request and clears auth cookies if successful */
  async logout() {
    const response = await this.post("/users/logout");
    this.clearAuth()
    return response.data;
  }

  /** Removes auth cookies */
  clearAuth() {
    Cookies.remove("auth_token");
  }

  /** Fetches a user account */
  async getUser(username: string): Promise<User> {
    const response = await this.get("/users/" + username);
    return response.data;
  }

  /** Fetches all user accounts. Requires auth. */
  async getAll(role?: userRole): Promise<User[]> {
    const response = await this.get("/users/", {
      role: role,
    });
    return response.data;
  }

  /** Creates an editor account. */
  async createUser(userData: UserCreationRequest): Promise<User> {
    const response = await this.post("/users/", userData);
    return response.data;
  }

  /** Updates a user's data. */
  async updateUser(username:string, userData: UserUpdateRequest): Promise<User> {
    const response = await this.patch("/users/" + username, userData);
    return response.data;
  }

  /** Returns whether auth cookies are present. Does not validate them. */
  isLoggedIn() {
    return Cookies.get("auth_token") !== undefined // Checking for expiration is not necessary, as the cookie is set to expire after the same timeframe as the token.
  }

  /** Returns the username of the current session, or null if the client is not logged in. */
  getCurrentUsername(): string|null {
    const cookie = Cookies.get("auth_token")
    if (!cookie) return null;
    const payload = this.parseJwt(cookie)
    return (payload as AuthTokenPayload).sub
  }

  /**
   * Extracts the payload from a JWT token.
   * Source: https://stackoverflow.com/a/38552302
   * */
  private parseJwt(token: string): object {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }
}

export default UserService
