/**
 * Defines Nuxt keyboard shortcuts for all possible single and 2-key combinations.
 */

// Generate all possible modifier+key combinations
// TODO allow 2 modifiers?
let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
let symbols = ';\'\",./?=+`\\'.split('')
let specialKeys = [' ', 'enter', 'tab']
let allKeys = [...alphabet, ...symbols, ...specialKeys]
let modifiers = ['ctrl', 'shift'] // 'alt' appears to be unusable in major browsers.

export const useArbitraryKeyshortcuts = (handler: (keybind: string) => void, whenever?: (keys: string) => boolean) => {
  
  let shortcutEntries: {[key: string]: object} = {} // TODO import type - but from where?
  for (const modifier of modifiers) {
    for (const key of allKeys) {
      const nuxtKeyComboID = modifier === '' ? key : `${modifier}_${key}`
      const shortcutEntry = {
        usingInput: true,
        whenever: whenever ? [() => {
          return whenever(nuxtKeyComboID)
        }] : [],
        handler: () => {
          handler(nuxtKeyComboID)
        }, 
      }
      shortcutEntries[nuxtKeyComboID] = shortcutEntry
    }
  }
  return shortcutEntries
}