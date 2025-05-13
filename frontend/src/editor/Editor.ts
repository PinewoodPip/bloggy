/**
 * Base types for editor model.
 */
import { EditorState, Transaction } from 'prosemirror-state'
import { Schema } from 'prosemirror-model'
import { Action } from './actions/Action'
import { DocumentSerializer } from '~/src/editor/markdown/Serializer'
import { ProseMirrorUtils } from '~/utils/ProseMirror'
import { ToolManager, type toolIdentifier, type MultiTool, type Tool, type ToolDef } from './ToolManager'
import type { EditorView } from 'prosemirror-view'

export type actionID = string
/** In the format "{modifier}_{key}" */
export type keybind = string
export type alertType = 'note' | 'tip' | 'important' | 'warning'
export type alignmentType = 'left' | 'right' | 'center' | 'justify'
export type AlertAttrs = {type: alertType}
export type LinkAttrs = {href: string, title?: string}
export type ImageAttrs = {
  src: string,
  alt?: string,
  /** In pixels. */
  maxHeight?: integer
}
export type EmbedAttrs = {type: string, contentID: string}
export type FootnoteAttrs = {index: integer, text: string}
export type AnnotationAttrs = {author: string, comment: string}

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

  /** Returns whether the action is being used in the context of the document. */
  isActive(state: EditorState): boolean,

  /** Returns whether the item is contextually applicable to the current document state. */
  isApplicable(state: EditorState): boolean,

  /** Returns the recommended default keybind for this action. */
  getDefaultKeyCombo(): keybind | null,
}

/** Main editor model class. Holds registered actions. */
export class Editor {
  /** ProseMirror editor instance getter. */
  private pmViewGetter: () => EditorView
  private _schema: Schema

  actions: {[id: actionID]: IAction} = {}

  private toolManager: ToolManager

  // Action keybind mappings
  private customToolBindings: {[id: toolIdentifier]: keybind} = {}
  private customBindingToTool: {[combo: keybind]: toolIdentifier} = {}

  constructor(schema: Schema, pmViewGetter: () => EditorView) {
    this.toolManager = new ToolManager()
    this.pmViewGetter = pmViewGetter
    this._schema = schema
  }

  /** Registers an editor action. */
  registerAction(id: actionID, action: IAction) {
    this.actions[id] = action

    // Set default keybind
    const defaultKeybind = action.getDefaultKeyCombo()
    this.setToolKeybind(id, defaultKeybind)
  }

  /** Returns a registered action by its ID. */
  getAction(id: actionID): IAction {
    if (!this.actions[id]) {
      throw 'Action not registered: ' + id
    }
    return this.actions[id]
  }
  
  /** The document's ProseMirror schema. */
  get schema() {
    return this._schema
  }

  /** Returns whether an item ID corresponds to an action. */
  isAction(id: toolIdentifier): boolean {
    return this.actions[id] !== undefined
  }

  /** Executes an action over the current selection. */
  executeAction(actionID: string, params?: object) {
    const action = this.getAction(actionID)
    const documentView = toRaw(this.pmViewGetter())

    // Run action and apply transaction
    let transaction = action.execute(documentView.state, params)
    if (transaction) {
      Promise.resolve(transaction).then((a) => {
        documentView.dispatch(a)
      })
    }
  }

  /** Returns the toolbar model. */
  getToolManager(): ToolManager {
    return this.toolManager
  }

  /** Returns whether a tool is currently being used. */
  isToolActive(state: EditorState, item: Tool): boolean {
    return item.isActive && item.isActive(state)
  }

  /** Returns whether a tool is applicable to the current document state and selection. */
  isToolApplicable(state: EditorState, item: Tool): boolean {
    return !item.isApplicable || item.isApplicable(state)
  }

  /** Returns the keybind for an action. */
  getToolKeybind(toolID: toolIdentifier): keybind | null {
    const customKeybind = this.customToolBindings[toolID]
    return customKeybind ? customKeybind : null
  }

  /** Sets the custom keybind for an action. Use null to clear a binding. */
  setToolKeybind(toolID: toolIdentifier, combo: keybind | null | undefined) {
    // Clear previous binding
    const previousBinding = this.customToolBindings[toolID]
    if (previousBinding) {
      delete this.customBindingToTool[previousBinding]
    }
    delete this.customToolBindings[toolID]

    // Set binding
    if (combo && this.customBindingToTool[combo] !== toolID && this.customBindingToTool[combo]) {
      throw "Binding is already in use by another action " + this.customBindingToTool[combo]
    }
    if (combo) {
      this.customBindingToTool[combo] = toolID
      this.customToolBindings[toolID] = combo
    }
  }

  /** Returns the action associated to a keybind. */
  getItemForKeybind(keyCombo: keybind): IAction | null {
    const customBindingAction = this.customBindingToTool[keyCombo]
    return customBindingAction !== undefined ? this.getAction(customBindingAction) : null
  }

  /** Returns the default keybind for a toolbar item. */
  getDefaultItemKeybind(item: Tool | toolIdentifier) : keybind | null {
    const actionID = typeof(item) === 'object' ? item.id : item // ID overload.
    const action = this.actions[actionID] ? this.getAction(actionID) : null
    return action ? action.getDefaultKeyCombo() : null
  }

  /** Serializes a document to a Markdown-like string. */
  serializeDocument(state: EditorState): string {
    let markdownStr = DocumentSerializer.serialize(state.doc)

    // Insert footnote content required by the footnotes plugin
    const footnotes = ProseMirrorUtils.findNodes(state, this.schema.nodes['footnote'])
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
      keybinds: this.customToolBindings,
      hiddenActions: [...this.toolManager.getHiddenTools().values()],
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
        this.setToolKeybind(actionID, keybind)
      }

      // Apply toolbar preferences
      for (const actionID of parsedSaveData.hiddenActions || []) {
        this.toolManager.setToolVisible(actionID, false)
      }
    }
  }
}
