<!-- Action toolbar. -->
<template>
  <div class="small-content-block flex">
    <div class="flex p-2">
      <!-- Action groups -->
      <div v-for="group in editor.getActionGroups()" class="flex">
        <!-- Actions of the group -->
        <div class="flex gap-x-2">
          <EditorActionButton v-for="actionID in group.actions" :action="editor.getAction(actionID)" :editor="props.editorView" :state="props.state" @use="useAction"/>
        </div>
        <!-- Should be outside the actions container to avoid applying gap to it -->
        <div class="divider divider-horizontal mx-1"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor } from '~/composables/editor/Toolbar';
import * as Editor from '../../composables/editor/Editor'
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

</script>