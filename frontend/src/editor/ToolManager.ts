/**
 * Model classes for toolbar items.
 */
import type { actionID, IAction } from "./Editor"
import { EditorState } from 'prosemirror-state'

export type toolType = 'callback'|'action'|'multitool'
export type toolIdentifier = string

/** Represents an editor interaction that should be presented to the user. Does not need to correspond to direct document edits. */
export interface Tool {
  type: toolType,
  id: toolIdentifier,
  def: ToolDef,

  /** Returns whether the item is contextually applicable to the current document state. */
  isApplicable: (state: EditorState) => boolean,
  
  /** Returns whether the item is currently being used in the document. */
  isActive: (state: EditorState) => boolean,
}

/** User-friendly metadata for a tool. */
export interface ToolDef {
  name: string,
  /** A longer, more descriptive name for use where the item's context is unclear. */
  longName?: string,
  icon: string,
}

/** A tool that triggers a callback to the editor. Intended to be used to trigger complex user interaction flows. */
export class CallbackTool implements Tool {
  type: 'callback'
  id: actionID
  def: ToolDef

  constructor(id: actionID, def: ToolDef) {
    this.type = 'callback'
    this.id = id
    this.def = def
  }

  isActive(state: EditorState): boolean {
    return false
  }

  isApplicable(state: EditorState): boolean {
    return true
  }
}

/** A tool that directly corresponds to an editor action. */
export class ActionTool implements Tool {
  type: 'action'
  id: actionID
  action: IAction
  def: ToolDef

  constructor(action: IAction, def: ToolDef) {
    this.type = 'action'
    this.id = action.id
    this.action = action
    this.def = def
  }

  isApplicable(state: EditorState): boolean {
    return this.action.isApplicable(state)
  }

  isActive(state: EditorState): boolean {
    return this.action.isActive(state)
  }
}

/** Groups up related tools into a parent tool that represents them as one. */
export class MultiTool implements Tool {
  type: 'multitool'
  subitems: Tool[]
  def: ToolDef
  id: toolIdentifier

  constructor(id: string, def: ToolDef, subitems: Tool[]) {
    this.type = 'multitool'
    this.subitems = subitems
    this.id = id
    this.def = def
  }

  isActive(state: EditorState): boolean {
    // The menu is active if any of its tools is.
    for (const tool of this.subitems) {
      if (tool.isActive(state)) {
        return true
      }
    }
    return false
  }

  isApplicable(state: EditorState): boolean {
    return true
  }
}

/** Groups multiple tools of the same thematic purpose. */
export type ToolGroup = {
  name: string,
  tools: toolIdentifier[],
}

/** Groups multiple tool groups, representing a major set of interaction items in the editor. */
export interface ToolPalette {
  id: string,
  /** The group's tools, intended to be organized thematically. */
  toolGroups: ToolGroup[],
}

export type ItemUsedCallback = ((item: Tool) => void)

/** Tracks registered editor tools and the user's preferences for them. */
export class ToolManager {
  private toolPalettes: {[key: string]: ToolPalette} = {}
  private tools: {[key: string]: Tool} = {}

  /** Tools that the user has marked as irrelevant to them. */
  private hiddenItems: Set<toolIdentifier> = new Set()
  
  /** Returns all tool palettes in order of registration. */
  getToolPalettes(): {[key: string]: ToolPalette} {
    return this.toolPalettes
  }

  /** Returns a tool palette by ID. */
  getToolPalette(id: string): ToolPalette {
    return this.toolPalettes[id]
  }

  /** Registers a tool to be available for use in tool palettes. */
  registerTool(item: Tool) {
    this.tools[item.id] = item
  }

  /** Returns a tool by ID. */
  getTool(id: string): Tool {
    return this.tools[id];
  }

  /** Registers a tool palette. */
  registerToolPalette(palette: ToolPalette) {
    this.toolPalettes[palette.id] = palette
  }

  /** Returns whether a tool should be available in groups or hidden from the user. */
  isToolVisible(itemID: toolIdentifier) {
    return !this.hiddenItems.has(itemID)
  }

  /** Returns whether a tool is applicable to the current document state. */
  isToolApplicable(state: EditorState, tool: Tool): boolean {
    return !tool.isApplicable || tool.isApplicable(state) 
  }

  /** Returns the tools that should be hidden from the user. */
  getHiddenTools() : Set<toolIdentifier> {
    return this.hiddenItems
  }

  /** Sets whether a tool should be presented to the user. */
  setToolVisible(itemID: toolIdentifier, visible: boolean) {
    if (!visible) {
      this.hiddenItems.add(itemID)
    } else {
      this.hiddenItems.delete(itemID)
    }
  }
}