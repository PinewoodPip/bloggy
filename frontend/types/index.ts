
export { }

declare global {
  type integer = number
  /** ISO 8601 date */
  type dateISOString = string
  type base64String = string
  /** Slash-delimited resource path, with a leading slash. */
  type path = string
  /** Prefixed with a dot. */
  type fileExtension = string

  type DynamicComponentDef = {
    component: Component | string,
    props: object,
  }
}
