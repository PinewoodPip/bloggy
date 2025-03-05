import * as Editor from './editor/Editor'

class Stringifier {
  static stringify(keybind: Editor.keybind): string {
    const components = keybind.split("_")
    return components.join(" + ")
  }
}

export const useKeybindStringifier = () => {
  return Stringifier
}