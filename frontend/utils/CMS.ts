/**
 * Utilities for working with the CMS.
 */
export const CMSUtils = {
  /** Resolves a path from the backend to where the resource maps on the frontend. */
  resolveFilePath(path: path) {
    return '/files' + path
  },

  /** Resolves an article path to its frontend route. */
  resolveArticlePath(path: path) {
    return '/articles' + path
  },

  /** Resolves a category path to its frontend route. */
  resolveCategoryPath(path: path) {
    return '/categories' + path
  },
}