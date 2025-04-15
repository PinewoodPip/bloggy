/**
 * Model classes for toolbar items.
 */
import type { actionID } from "./Editor"

export type actionGroupItemType = 'callback'|'action'|'actionMenu'
export type actionGroupItemIdentifier = actionID | string

/** Represents an item in a toolbar group. */
export interface GroupItem {
  type: actionGroupItemType,
  id: string,
  def: ItemDef,
}

/** User-friendly metadata for a toolbar item. */
export interface ItemDef {
  name: string,
  /** A longer, more descriptive name for use where the item's context is unclear. */
  longName?: string,
  icon: string,
}

/** Represents an item that should trigger a callback to the editor. */
export interface GroupCallback extends GroupItem {
  type: 'callback',
}

/** Represents a single action within a group. */
export interface GroupAction extends GroupItem {
  type: 'action',
  id: actionID,
}

/** Groups up items into a single toolbar item that opens a menu containing each item. */
export interface GroupActionMenu extends GroupItem {
  type: 'actionMenu',
  subitems: GroupItem[],
}

/** Groups multiple related toolbar items. */
export interface Group {
  name: string,
  items: GroupItem[],
}

export class Toolbar {
  private itemGroups: Group[] = []

  /** Actions that should not be shown in the toolbar. */
  private hiddenItems: Set<actionGroupItemIdentifier> = new Set()
  
  /** Returns all action groups in order of registration. */
  getToolbarGroups(): Group[] {
    return this.itemGroups
  }

  /** Registers an action group. Will be the last in the list. */
  registerToolbarGroup(group: Group) {
    this.itemGroups.push(group)
  }

  /** Returns whether an action should appear in the toolbar. */
  isItemVisible(itemID: actionGroupItemIdentifier) {
    return !this.hiddenItems.has(itemID)
  }

  /** Returns the items that should be hidden from the user. */
  getHiddenItems() : Set<actionGroupItemIdentifier> {
    return this.hiddenItems
  }

  /** Sets whether an item should appear in the toolbar. */
  setItemVisible(itemID: actionGroupItemIdentifier, visible: boolean) {
    if (!visible) {
      this.hiddenItems.add(itemID)
    } else {
      this.hiddenItems.delete(itemID)
    }
  }
}