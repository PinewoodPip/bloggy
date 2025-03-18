/**
 * String utility functions.
 */

export const StringUtils = {
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}