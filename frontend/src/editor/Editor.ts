/**
 * Base types for editor model.
 */
import { EditorState, Transaction } from 'prosemirror-state'
import { Action } from './actions/Action'

export type actionID = string
/** In the format "{modifier}_{key}" */
export type keybind = string
export type alertType = 'note' | 'tip' | 'important' | 'caution' | 'warning'

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
  execute(state: EditorState): Promise<Transaction | null>,

  /** Returns whether the action is being used. */
  isActive(state: EditorState): boolean,

  /** Returns the recommended default keybind for this action. */
  getDefaultKeyCombo(): keybind | null,
}

export type actionGroupItemType = 'action'|'actionMenu'

export interface ToolbarGroupItem {
  type: actionGroupItemType,
}

export interface ToolbarGroupAction extends ToolbarGroupItem {
  type: 'action',
  actionID: string,
}

/** Groups up actions into a single toolbar item that opens a menu containing each action. */
export interface ToolbarGroupActionMenu extends ToolbarGroupItem {
  type: 'actionMenu',
  name: string,
  icon: string,
  actionIDs: string[],
}

/** Groups multiple related toolbar items. */
export interface ToolbarGroup {
  name: string,
  items: ToolbarGroupItem[],
}

/** Main editor model class. Holds registered actions. */
export class Editor {
  actions: {[id: actionID]: IAction} = {}
  toolbarGroups: ToolbarGroup[] = []

  // Action keybind mappings
  private customActionBindings: {[id: actionID]: keybind} = {}
  private customBindingToAction: {[combo: keybind]: actionID} = {}

  /** Actions that should not be shown in the toolbar. */
  private hiddenActions: Set<actionID> = new Set()

  /** Registers an editor action. */
  registerAction(action: Action) {
    this.actions[action.def.id] = action
  }

  /** Registers an action group. Will be the last in the list. */
  registerToolbarGroup(group: ToolbarGroup) {
    this.toolbarGroups.push(group)
  }

  /** Returns all action groups in order of registration. */
  getToolbarGroups(): ToolbarGroup[] {
    return this.toolbarGroups
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

  /** Returns whether an action should appear in the toolbar. */
  isActionVisibleInToolbar(actionID: actionID) {
    return !this.hiddenActions.has(actionID)
  }

  /** Sets whether an action should appear in the toolbar. */
  setActionVisibleInToolbar(actionID: actionID, visible: boolean) {
    if (!visible) {
      this.hiddenActions.add(actionID)
    } else {
      this.hiddenActions.delete(actionID)
    }
  }

  /** 
   * Saves the user's editor settings to localstorage.
   * Different storage keys may be used to distinguish
   * preference sets across different editor contexts.
   */
  savePreferences(storageKey: string) {
    const saveData = {
      keybinds: this.customActionBindings,
      hiddenActions: [...this.hiddenActions.values()],
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

      // Apply toolbar preferences
      for (const actionID of parsedSaveData.hiddenActions || []) {
        this.setActionVisibleInToolbar(actionID, false)
      }
    }
  }
}
