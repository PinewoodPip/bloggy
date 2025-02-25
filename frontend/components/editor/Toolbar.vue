<!-- Action toolbar. -->
<template>
  <div class="small-content-block flex">
    <div class="flex p-2">
      <!-- Action groups -->
      <div v-for="group in toolbar.actionGroups" class="flex">
        <!-- Actions of the group -->
        <div class="flex gap-x-2">
          <EditorActionButton v-for="action in group.actions" :action="action" :editor="props.editor" :state="props.state" @use="useAction"/>
        </div>
        <!-- Should be outside the actions container to avoid applying gap to it -->
        <div class="divider divider-horizontal mx-1"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTools } from '~/composables/editor/Toolbar';
import * as Editor from '../../composables/editor/Editor'
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

const toolbar = useTools()

const props = defineProps<{
  editor: EditorView,
  state: EditorState,
}>()

const emit = defineEmits<{
  actionUse: [Editor.IAction]
}>()

function useAction(action: Editor.IAction) {
  emit('actionUse', action)
}

</script>