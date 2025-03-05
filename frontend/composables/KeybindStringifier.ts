import * as Editor from './editor/Editor'

class Stringifier {
  static stringify(keybind: Editor.keybind): string {
    const components = keybind.split("_")
    for (const i in components) {
      const component = components[i]
      components[i] = component.charAt(0).toUpperCase() + component.slice(1)
    }
    return components.join(" + ")
  }
}

export const useKeybindStringifier = () => {
  return Stringifier
}