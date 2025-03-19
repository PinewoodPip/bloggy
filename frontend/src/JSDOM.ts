/** Copies JSDOM objects to globals to simulate a browser environment. */
import { JSDOM } from 'jsdom'

export function applyJSDOM() {
  const jsdom = new JSDOM()
  const window = jsdom.window
  global.window = window
  global.document = window.document
  global.HTMLElement = window.HTMLElement
  global.navigator = window.navigator
}
