<!-- Editor text area component, with context menu and widget modals support. -->
<template>
  <div class="large-content-block flex-grow" @contextmenu.prevent="onContextMenu">
    <ProsemirrorAdapterProvider>
      <EditorProseMirrorWrapper ref="documentRef" :initial-content="initialContent" />
    </ProsemirrorAdapterProvider>
  </div>
  
  <!-- Context menu -->
  <ContextMenu v-model="contextMenuOpen" :items="contextMenuItems" />

  <!-- Widgets -->
  <EditorWidgetsManager ref="widgets" />
</template>

<script setup lang="ts">
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'
import { EditorState } from 'prosemirror-state'
import { Node } from 'prosemirror-model'
import * as Editor from '~/src/editor/Editor'
import * as Toolbar from '~/src/editor/Toolbar'
import type { EditorView } from 'prosemirror-view'
import ContextMenu from '~/components/context-menu/ContextMenu.vue'
import * as ClipboardActions from '~/src/editor/actions/Clipboard'
import { schema } from '~/src/editor/Schema'

const editorRef = useTemplateRef('documentRef')
const widgets = useTemplateRef('widgets')
const { editor, toolbar } = useEditorInjects()

const props = defineProps<{
  initialContent: string,
}>();

/** Callbacks available to node renderers. */
export type NodeCallbacks = {
  /** Notifies that the node should be selected for a node type-specific interaction. */
  selectNode(node: Node): void,
}

const contextMenuOpen = ref(false)

/** Executes an action over the current selection. */
function executeAction(actionID: string, params?: object) {
  const editorRaw = toRaw(editorRef.value)
  const view = toRaw(editorRaw!.editorView)
  toRaw(editor.value).executeAction(view!, actionID, params)
}

/** Execute action commands */
function onActionUsed(item: Toolbar.GroupItem | Toolbar.actionGroupItemIdentifier) {
  if (editorRef.value) {
    const itemID = typeof item === 'string' ? item : item.id // String overload.
    const editorRaw = toRaw(editorRef.value)
    const view = toRaw(editorRaw.editorView)
    const state = view?.state
    
    if (state) {
      if (editor.value.getAction(itemID)) {
        executeAction(itemID)
      } else {
        widgets.value!.onActionUsed(item)
      }
    }
  }
}

function onContextMenu() {
  contextMenuOpen.value = true
}

/** ProseMirror EditorView. */
const editorView = computed(() => {
  const editorRaw = toRaw(editorRef.value)
  const view = toRaw(editorRaw?.editorView) as EditorView
  return view
})

/** ProseMirror EditorState. */
const editorState = computed(() => {
  const editorRaw = toRaw(editorRef.value)
  const state = toRaw(editorRaw?.editorState) as EditorState
  return state
})

// Expose PM editor classes
defineExpose({
  editorView,
  editorState,
  onActionUsed,
})

/** Options shown in the context menu. */
const contextMenuItems = computed(() => {
  const items: object[][] = []

  // Add clipboard actions
  const clipboardItems = []
  for (const item of ClipboardActions.actionGroup.items) {
    clipboardItems.push(getActionContextMenuEntry(item))
  }

  items.push(clipboardItems)
  return items
})

// TODO move
function getActionContextMenuEntry(item: Toolbar.GroupItem): object {
  return {
    label: item.def.name,
    icon: item.def.icon,
    click: () => {executeAction(item.id)},
  }
}

/** Returns the action bound to a key combination. */
function getKeyComboAction(keyCombo: Editor.actionID): Editor.IAction | null {
  return editor.value.getItemForKeybind(keyCombo)
}

/** Returns whether a key combo is bound to any action. */
function isKeyComboBound(keyCombo: Editor.actionID) {
  return getKeyComboAction(keyCombo) !== null
}

/** Provide callbacks for nodes to notify they should be selected. */
provide<NodeCallbacks>('nodeCallbacks', {
  selectNode(node: Node) {
    if (node.type == schema.nodes.footnote) {
      widgets.value!.selectFootnote(node)
    } else if (node.type === schema.nodes.image) {
      widgets.value!.selectImage(node)
    } else if (node.type === schema.nodes.embed) {
      widgets.value!.selectEmbed(node)
    }
  }
})

// TODO would be clearer to reader if this used an object
const shortcutEntries = useArbitraryKeyshortcuts(
  (keys) => {
    const action = getKeyComboAction(keys)
    if (action) {
      onActionUsed(action.id)
    }
  },
  (keys) => {
    return isKeyComboBound(keys)
  },
)
// @ts-ignore The type used is not exported from Nuxt UI.
defineShortcuts(shortcutEntries)

</script>