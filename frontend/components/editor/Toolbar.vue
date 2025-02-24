<template>
  <div class="small-content-block flex">
    <div class="flex p-2">
      <div v-for="group in toolbar.actionGroups" class="flex">
        <div class="flex gap-x-2">
          <EditorActionButton v-for="action in group.actions" :action="action"/>
        </div>
        <div class="divider divider-horizontal mx-1"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTools } from '~/composables/editor/Toolbar';

const toolbar = useTools()

</script>