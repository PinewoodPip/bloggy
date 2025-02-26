/**
 * Base types for editor model.
 */
import { EditorState, Transaction } from 'prosemirror-state'
import { Action } from './action/Action'

export type actionID = string
export type keyCombo = string

/** Action descriptor. */
export interface ActionDef {
  name: string,
  icon: string,
}

/** 
 * Interface for editor actions,
 * which can be executed to edit the document or editor view.
 */
export interface IAction {
  def: ActionDef,

  /** Runs the action's effect. */
  execute(state: EditorState): Transaction|null,

  /** Returns whether the action is being used. */
  isActive(state: EditorState): boolean,

  /** Returns the recommended default keybind for this action. */
  getDefaultKeyCombo(): keyCombo | null,
}

/** Groups multiple related actions. */
export interface ActionGroup {
  name: string,
  actions: string[]
}

/** Main editor model class. Holds registered actions. */
export class Editor {
  actions: {[key: actionID]: IAction} = {}
  actionGroups: ActionGroup[] = []

  registerAction(action: Action) {
    var actionClass = <typeof Action>action.constructor; 
    this.actions[actionClass.ID] = action
  }

  registerActionGroup(group: ActionGroup) {
    this.actionGroups.push(group)
  }

  getActionGroups(): ActionGroup[] {
    return this.actionGroups
  }

  getAction(id: actionID): IAction {
    if (!this.actions[id]) {
      throw 'Action not registered: ' + id
    }
    return this.actions[id]
  }

  getActionForKeyCombo(keyCombo: keyCombo): IAction | null {
    // TODO optimize; pre-compute a map
    for (let actionID in this.actions) {
      const action = this.actions[actionID]
      if (action.getDefaultKeyCombo() === keyCombo) {
        return action
      }
    }
    return null
  }
}
