/**
 * Utility functions for direct DOM operations.
 */

/** Scrolls the browser to put an element into view. */
export function scrollViewToElement(view: Ref<HTMLElement | null>) { 
  view.value?.scrollIntoView({ behavior: 'smooth' }) 
}