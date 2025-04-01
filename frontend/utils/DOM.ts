/**
 * Utility functions for direct DOM operations.
 */
import * as cheerio from 'cheerio';

/** Scrolls the browser to put an element into view. */
export function scrollViewToElement(view: Ref<HTMLElement | null>) { 
  view.value?.scrollIntoView({ behavior: 'smooth' }) 
}

export function extractText($: cheerio.CheerioAPI): string {
  return $('html *').contents().map(function() {
    return (this.type === 'text') ? $(this).text()+' ' : '';
  }).get().join('');
}