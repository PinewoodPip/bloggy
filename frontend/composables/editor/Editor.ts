/**
 * Base types for editor model.
 */
import { EditorState, Transaction } from 'prosemirror-state'

export interface ActionGroup {
  name: string,
  actions: IAction[]
}

export interface Toolbar {
  actionGroups: ActionGroup[]
}

export interface ActionDef {
  name: string,
  icon: string,
}

export interface IAction {
  def: ActionDef,

  /** Runs the action's effect. */
  execute(state: EditorState): Transaction|null,

  /** Returns whether the action is being used. */
  isActive(state: EditorState): boolean,
}
