
export { }

declare global {
  type User = {
    username: string,
    role: "admin"|"editor",
    display_name: string,
  }
}
