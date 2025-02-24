
class FormatBold implements Editor.Action {
  def: Editor.ActionDef

  constructor() {
    this.def = {
      name: 'Toggle Bold',
      icon: 'i-heroicons-bold',
    }
  }
}

class FormatItalic implements Editor.Action {
  def: Editor.ActionDef

  constructor() {
    this.def = {
      name: 'Toggle Italics',
      icon: 'i-heroicons-italic',
    }
  }
}

class Undo implements Editor.Action {
  def: Editor.ActionDef

  constructor() {
    this.def = {
      name: 'Undo',
      icon: 'i-heroicons-arrow-uturn-left-solid',
    }
  }
}

class Redo implements Editor.Action {
  def: Editor.ActionDef

  constructor() {
    this.def = {
      name: 'Right',
      icon: 'i-heroicons-arrow-uturn-right-solid',
    }
  }
}

var tools: Editor.Toolbar = {
  actionGroups: [
    {
      name: 'History',
      actions: [
        new Undo(),
        new Redo(),
      ]
    },
    {
      name: 'Formatting',
      actions: [
        new FormatBold(),
        new FormatItalic(),
      ]
    },
  ]
}

export const useTools = () => {
  return tools
}

