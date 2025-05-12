<!-- Minimally-styled toolbar component. -->
<template>
  <div class="flex px-1 overflow-x-auto">
    <!-- Action groups -->
    <div v-for="group in visibleGroups" class="flex">
      <!-- Actions of the group -->
      <div class="flex gap-x-0.5">
        <component v-for="item in getVisibleGroupItems(group)" :is="getGroupItemComponent(item)" v-bind="getGroupItemComponentProps(item)" />
      </div>
      <!-- Should be outside the actions container to avoid applying gap to it -->
      <div class="divider divider-horizontal mx-0"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Tools from '~/src/editor/ToolManager'
import CallbackButton from '~/components/article-editor/toolbar/CallbackButton.vue'
import MenuButton from '~/components/article-editor/toolbar/MenuButton.vue'

const { visibleGroups, getVisibleGroupItems } = useEditorToolbarItems()

// Component, props and event getters for the dynamic toolbar item component
function getGroupItemComponent(item: Tools.Tool) {
  if (item.type === 'multitool') {
    return MenuButton
  } else if (item.type === 'callback' || item.type === 'action') {
    return CallbackButton
  } else {
    throw "Unimplemented group item: " + item.type
  }
}
function getGroupItemComponentProps(item: Tools.Tool) {
   if (item.type === 'multitool') {
    return {
      menu: item as Tools.MultiTool,
    }
  } else if (item.type === 'callback' || item.type === 'action') {
    return {
      item: item,
    }
  } else {
    throw "Unimplemented group item: " + item.type
  }
}

</script>