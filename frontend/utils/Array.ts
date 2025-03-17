/** 
 * Array utility functions.
 */

export const ArrayUtils = {
  /** Returns whether any item in an array meets a predicate. */
  anyInArray<T>(arr: Array<T>, predicate: (item: T, index: integer) => boolean) {
    return arr.find(predicate) !== undefined
  }
}