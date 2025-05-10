<!-- A minimal editor setup. -->
<template>
  <div class="bg-base-100 border border-base-300 rounded-md p-1">
    <!-- Toolbar -->
    <SimpleEditorToolbar v-if="editorState" />

    <FaintHr class="border-base-300 mt-1" />

    <!-- Document -->
    <div @contextmenu.prevent="contextMenu?.open()">
      <slot name="document" />
    </div>
  </div>

  <!-- Context menu -->
  <EditorDocumentContextMenu ref="contextMenu" />

  <!-- Widgets -->
  <EditorWidgetsManager ref="widgets" />
</template>

<script setup lang="ts">

const contextMenu = useTemplateRef('contextMenu')
const { editorState } = useEditorInjects()

</script>