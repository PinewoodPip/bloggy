/**
 * Exposes toolbar model data.
 */
import * as Editor from './Editor'
import historyActionGroup from './action/History'
import formattingActionGroup from './action/Formatting'

// Initialize toolbar
var tools: Editor.Toolbar = {
  actionGroups: [
    historyActionGroup,
    formattingActionGroup,
  ]
}

export const useTools = () => {
  return tools
}

