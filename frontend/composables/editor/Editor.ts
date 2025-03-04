/**
 * Base types for editor model.
 */
import { EditorState, Transaction } from 'prosemirror-state'
import { Action } from './action/Action'

export type actionID = string
export type keyCombo = string

/** Action descriptor. */
export interface ActionDef {
  id: string,
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
  actions: {[id: actionID]: IAction} = {}
  actionGroups: ActionGroup[] = []

  // Action keybind mappings
  customActionBindings: {[id: actionID]: keyCombo} = {}
  customBindingToAction: {[combo: keyCombo]: actionID} = {}

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

  getActionKeybind(id: actionID): keyCombo | null {
    const customKeybind = this.customActionBindings[id]
    return customKeybind
  }

  /** Sets the custom keybind for an action. Use null to clear a binding. */
  setActionKeybind(actionID: actionID, combo: keyCombo | null | undefined) {
    // Clear previous binding
    const previousBinding = this.customActionBindings[actionID]
    if (previousBinding) {
      delete this.customBindingToAction[previousBinding]
    }
    delete this.customActionBindings[actionID]

    // Set binding
    if (combo && this.customBindingToAction[combo] !== actionID && this.customBindingToAction[combo]) {
      throw "Binding is already in use by another action " + this.customBindingToAction[combo]
    }
    if (combo) {
      this.customBindingToAction[combo] = actionID
      this.customActionBindings[actionID] = combo
    }
  }

  /** Returns the action associated to a keybind. */
  getActionForKeybind(keyCombo: keyCombo): IAction | null {
    const customBindingAction = this.customBindingToAction[keyCombo]
    return customBindingAction !== undefined ? this.getAction(customBindingAction) : null
  }

  /** 
   * Saves the user's editor settings to localstorage.
   * Different storage keys may be used to distinguish
   * preference sets across different editor contexts.
   */
  savePreferences(storageKey: string) {
    const saveData = {
      keybinds: this.customActionBindings,
    }
    window.localStorage.setItem(storageKey, JSON.stringify(saveData))
  }

  /**
   * Applies the user's editor settings from localstorage.
   * Different storage keys may be used to distinguish
   * preference sets across different editor contexts.
   */
  loadPreferences(storageKey: string) {
    const jsonData = window.localStorage.getItem(storageKey)
    if (jsonData) {
      const parsedSaveData = JSON.parse(jsonData)

      // Apply keybinds
      for (const actionID in parsedSaveData.keybinds) {
        const keybind = parsedSaveData.keybinds[actionID]
        this.setActionKeybind(actionID, keybind)
      }
    }
  }
}
