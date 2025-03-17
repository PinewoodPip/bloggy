<!-- Action toolbar. -->
<template>
  <div class="small-content-block flex">
    <div class="flex p-2">
      <!-- Action groups -->
      <div v-for="group in visibleGroups" class="flex">
        <!-- Actions of the group -->
        <div class="flex gap-x-2">
          <component v-for="item in getVisibleGroupItems(group)" :is="getGroupItemComponent(item)" v-bind="getGroupItemComponentProps(item)" v-on="getGroupItemComponentEvents(item)" />
        </div>
        <!-- Should be outside the actions container to avoid applying gap to it -->
        <div class="divider divider-horizontal mx-1"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Editor from '~/src/editor/Editor'
import ActionButton from './ActionButton.vue'
import ActionMenuButton from './ActionMenuButton.vue'
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

const props = defineProps<{
  editor: Editor.Editor,
  editorView: EditorView,
  state: EditorState,
}>()

const emit = defineEmits<{
  actionUse: [Editor.IAction]
}>()

function useAction(action: Editor.IAction) {
  emit('actionUse', action)
}

/** Toolbar groups to show, based on user preferences. */
const visibleGroups = computed(() => {
  const groups: Editor.ToolbarGroup[] = []
  for (const group of props.editor.getToolbarGroups()) {
    // Check if any action in the group is visible
    const visible = getVisibleGroupItems(group).length > 0
    if (visible) {
      groups.push(group)
    }
  }
  return groups
})

/** Returns the visible items of a toolbar group. */
function getVisibleGroupItems(group: Editor.ToolbarGroup) {
  const items: Editor.ToolbarGroupItem[] = []
  for (const item of group.items) {
    let visible = false
    if (item.type === 'action') {
      visible = props.editor.isActionVisibleInToolbar((item as Editor.ToolbarGroupAction).actionID)
    } else if (item.type === 'actionMenu') {
      const menuActions = (item as Editor.ToolbarGroupActionMenu).actionIDs
      visible = ArrayUtils.anyInArray(menuActions, (actionID) => {
        return props.editor.isActionVisibleInToolbar(actionID)
      })
    } else {
      throw 'Unsupported item type ' + item.type
    }
    if (visible) {
      items.push(item)
    }
  }
  return items
}

// Component, props and event getters for the dynamic toolbar item component
function getGroupItemComponent(item: Editor.ToolbarGroupItem) {
  if (item.type === 'action') {
    return ActionButton
  } else if (item.type === 'actionMenu') {
    return ActionMenuButton
  } else {
    throw "Unimplemented group item: " + item.type
  }
}
function getGroupItemComponentProps(item: Editor.ToolbarGroupItem) {
  if (item.type === 'action') {
    return {
      action: props.editor.getAction((item as Editor.ToolbarGroupAction).actionID),
      editor: props.editor,
      state: props.state,
    }
  } else if (item.type === 'actionMenu') {
    return {
      menu: item as Editor.ToolbarGroupActionMenu,
      editor: props.editor,
      state: props.state,
    }
  } else {
    throw "Unimplemented group item: " + item.type
  }
}
function getGroupItemComponentEvents(item: Editor.ToolbarGroupItem) {
  if (item.type === 'action') {
    return {
      use: useAction,
    }
  } else if (item.type === 'actionMenu') {
    return {
      useAction: useAction,
    }
  } else {
    throw "Unimplemented group item: " + item.type
  }
}

</script>