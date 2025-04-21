/**
 * Base types for editor model.
 */
import { EditorState, Transaction } from 'prosemirror-state'
import { Action } from './actions/Action'
import { DocumentSerializer } from '~/src/editor/markdown/Serializer'
import { ProseMirrorUtils } from '~/utils/ProseMirror'
import { schema } from '~/src/editor/Schema'
import { Toolbar, type actionGroupItemIdentifier, type GroupActionMenu, type GroupItem, type ItemDef } from './Toolbar'
import type { EditorView } from 'prosemirror-view'

export type actionID = string
/** In the format "{modifier}_{key}" */
export type keybind = string
export type alertType = 'note' | 'tip' | 'important' | 'caution' | 'warning'
export type alignmentType = 'left' | 'right' | 'center' | 'justify'
export type LinkAttrs = {href: string, title?: string}
export type ImageAttrs = {src: string, alt?: string}
export type EmbedAttrs = {type: string, contentID: string}
export type FootnoteAttrs = {index: integer, text: string}

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
  id: actionID,

  /** Runs the action's effect. */
  execute(state: EditorState, params?: object): Transaction | Promise<Transaction> | null,

  /** Returns whether the action is being used. */
  isActive(state: EditorState): boolean,

  /** Returns the recommended default keybind for this action. */
  getDefaultKeyCombo(): keybind | null,
}

/** Main editor model class. Holds registered actions. */
export class Editor {
  /** ProseMirror editor instance getter. */
  private pmViewGetter: () => EditorView

  actions: {[id: actionID]: IAction} = {}

  private toolbar: Toolbar

  // Action keybind mappings
  private customActionBindings: {[id: actionID]: keybind} = {}
  private customBindingToAction: {[combo: keybind]: actionID} = {}

  constructor(pmViewGetter: () => EditorView) {
    this.toolbar = new Toolbar()
    this.pmViewGetter = pmViewGetter
  }

  /** Registers an editor action. */
  registerAction(action: Action) {
    this.actions[action.id] = action
  }

  /** Returns a registered action by its ID. */
  getAction(id: actionID): IAction {
    if (!this.actions[id]) {
      throw 'Action not registered: ' + id
    }
    return this.actions[id]
  }

  /** Returns whether an item ID corresponds to an action. */
  isAction(id: actionGroupItemIdentifier): boolean {
    return this.actions[id] !== undefined
  }

  /** Executes an action over the current selection. */
  executeAction(actionID: string, params?: object) {
    const action = this.getAction(actionID)
    const documentView = this.pmViewGetter()

    // Run action and apply transaction
    let transaction = action.execute(documentView.state, params)
    if (transaction) {
      Promise.resolve(transaction).then((a) => {
        documentView.dispatch(a)
      })
    }
  }

  /** Returns the toolbar model. */
  getToolbar(): Toolbar {
    return this.toolbar
  }

  /** Returns whether a toolbar item is currently being used. */
  isItemActive(state: EditorState, item: GroupItem): boolean {
    if (item.type === 'action') {
      return this.getAction(item.id).isActive(state)
    } else if (item.type === 'actionMenu') {
      // Menus are active if any subitem is
      for (const subitem of (item as GroupActionMenu).subitems) {
        if (this.isItemActive(state, subitem)) {
          return true
        }
      }
    }
    return false
  }

  /** Returns the keybind for an action. */
  getItemKeybind(id: actionID): keybind | null {
    const customKeybind = this.customActionBindings[id]
    return customKeybind ? customKeybind : null
  }

  /** Sets the custom keybind for an action. Use null to clear a binding. */
  setItemKeybind(actionID: actionID, combo: keybind | null | undefined) {
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
  getItemForKeybind(keyCombo: keybind): IAction | null {
    const customBindingAction = this.customBindingToAction[keyCombo]
    return customBindingAction !== undefined ? this.getAction(customBindingAction) : null
  }

  /** Returns the default keybind for a toolbar item. */
  getDefaultItemKeybind(item: GroupItem | actionGroupItemIdentifier) : keybind | null {
    const actionID = typeof(item) === 'object' ? item.id : item // ID overload.
    const action = this.actions[actionID] ? this.getAction(actionID) : null
    return action ? action.getDefaultKeyCombo() : null
  }

  /** Serializes a document to a Markdown-like string. */
  serializeDocument(state: EditorState): string {
    let markdownStr = DocumentSerializer.serialize(state.doc)

    // Insert footnote content required by the footnotes plugin
    const footnotes = ProseMirrorUtils.findNodes(state, schema.nodes['footnote'])
    for (const footnote of footnotes) {
      const node = footnote.node
      let text: string = node.attrs.text
      text = text.replace(/ /g, '_') // Spaces need to be encoded differently
      markdownStr += `\n\n[^${node.attrs.index}--${text}]: `
    }

    return markdownStr
  }

  /** 
   * Saves the user's editor settings to localstorage.
   * Different storage keys may be used to distinguish
   * preference sets across different editor contexts.
   */
  savePreferences(storageKey: string) {
    const saveData = {
      keybinds: this.customActionBindings,
      hiddenActions: [...this.toolbar.getHiddenItems().values()],
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
        this.setItemKeybind(actionID, keybind)
      }

      // Apply toolbar preferences
      for (const actionID of parsedSaveData.hiddenActions || []) {
        this.toolbar.setItemVisible(actionID, false)
      }
    }
  }
}
