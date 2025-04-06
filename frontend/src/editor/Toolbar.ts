/**
 * Model classes for toolbar items.
 */
import type { actionID } from "./Editor"

export type actionGroupItemType = 'action'|'actionMenu'

export interface GroupItem {
  type: actionGroupItemType,
}

/** Represents a single action within a group. */
export interface GroupAction extends GroupItem {
  type: 'action',
  actionID: string,
}

/** Groups up actions into a single toolbar item that opens a menu containing each action. */
export interface GroupActionMenu extends GroupItem {
  type: 'actionMenu',
  name: string,
  icon: string,
  actionIDs: string[],
}

/** Groups multiple related toolbar items. */
export interface Group {
  name: string,
  items: GroupItem[],
}

export class Toolbar {
  private toolbarGroups: Group[] = []

  /** Actions that should not be shown in the toolbar. */
  private hiddenActions: Set<actionID> = new Set()
  
  /** Returns all action groups in order of registration. */
  getToolbarGroups(): Group[] {
    return this.toolbarGroups
  }

  /** Registers an action group. Will be the last in the list. */
  registerToolbarGroup(group: Group) {
    this.toolbarGroups.push(group)
  }

  /** Returns whether an action should appear in the toolbar. */
  isActionVisibleInToolbar(actionID: actionID) {
    return !this.hiddenActions.has(actionID)
  }

  /** Returns the actions that should be hidden from the user. */
  getHiddenActions() : Set<actionID> {
    return this.hiddenActions
  }

  /** Sets whether an action should appear in the toolbar. */
  setActionVisibleInToolbar(actionID: actionID, visible: boolean) {
    if (!visible) {
      this.hiddenActions.add(actionID)
    } else {
      this.hiddenActions.delete(actionID)
    }
  }
}