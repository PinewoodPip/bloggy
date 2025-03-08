<!-- Action toolbar. -->
<template>
  <div class="small-content-block flex">
    <div class="flex p-2">
      <!-- Action groups -->
      <div v-for="group in editor.getToolbarGroups()" class="flex">
        <!-- Actions of the group -->
        <div class="flex gap-x-2">
          <component v-for="item in group.items" :is="getGroupItemComponent(item)" v-bind="getGroupItemComponentProps(item)" v-on="getGroupItemComponentEvents(item)" />
        </div>
        <!-- Should be outside the actions container to avoid applying gap to it -->
        <div class="divider divider-horizontal mx-1"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Editor from '../../composables/editor/Editor'
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