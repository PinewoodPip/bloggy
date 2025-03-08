/**
 * Base types for editor model.
 */
import { EditorState, Transaction } from 'prosemirror-state'
import { Action } from './action/Action'

export type actionID = string
/** In the format "{modifier}_{key}" */
export type keybind = string

/** Action descriptor. */
export interface ActionDef {
  readonly id: string,
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
  getDefaultKeyCombo(): keybind | null,
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
  private customActionBindings: {[id: actionID]: keybind} = {}
  private customBindingToAction: {[combo: keybind]: actionID} = {}

  /** Registers an editor action. */
  registerAction(action: Action) {
    this.actions[action.def.id] = action
  }

  /** Registers an action group. Will be the last in the list. */
  registerActionGroup(group: ActionGroup) {
    this.actionGroups.push(group)
  }

  /** Returns all action groups in order of registration. */
  getActionGroups(): ActionGroup[] {
    return this.actionGroups
  }

  /** Returns a registered action by its ID. */
  getAction(id: actionID): IAction {
    if (!this.actions[id]) {
      throw 'Action not registered: ' + id
    }
    return this.actions[id]
  }

  /** Returns the keybind for an action. */
  getActionKeybind(id: actionID): keybind | null {
    const customKeybind = this.customActionBindings[id]
    return customKeybind ? customKeybind : null
  }

  /** Sets the custom keybind for an action. Use null to clear a binding. */
  setActionKeybind(actionID: actionID, combo: keybind | null | undefined) {
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
  getActionForKeybind(keyCombo: keybind): IAction | null {
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
