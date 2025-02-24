
export { }

declare global {
  /** Schema for GET /users/{username} */
  type User = {
    username: string,
    role: "admin"|"editor",

    // Following fields only present for editor accounts
    display_name?: string, 
    contact_email?: string,
    biography?: string,
  }

  /** Schema for POST /users/ */
  type UserCreationRequest = {
    username: string,
    password: string,
    display_name: string,
    biography?: string,
    contact_email?: string,
  }

    /** Schema for PATCH /users/ */
  type UserUpdateRequest = {
    username?: string,
    password?: string,
    display_name?: string,
    biography?: string,
    contact_email?: string|null,
  }

  namespace Editor {
    interface ActionDef {
      name: string,
      icon: string,
    }
    
    interface Action {
      def: ActionDef,
    }
  }
}

