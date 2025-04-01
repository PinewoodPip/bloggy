/**
 * Utility functions for direct DOM operations.
 */
import * as cheerio from 'cheerio';

export const DOMUtils = {
  /** Scrolls the browser to put an element into view. */
  scrollViewToElement(view: Ref<HTMLElement | null>) { 
    view.value?.scrollIntoView({ behavior: 'smooth' }) 
  },

  /** Extracts text from an HTML tree. */
  extractText($: cheerio.CheerioAPI): string {
    return $('html *').contents().map(function() {
      return (this.type === 'text') ? $(this).text()+' ' : '';
    }).get().join('');
  },
}