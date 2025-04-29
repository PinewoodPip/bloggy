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
import * as Toolbar from '~/src/editor/Toolbar'
import CallbackButton from '~/components/article-editor/toolbar/CallbackButton.vue'
import ActionMenuButton from '~/components/article-editor/toolbar/ActionMenuButton.vue'

const { visibleGroups, getVisibleGroupItems } = useEditorToolbarItems()

// Component, props and event getters for the dynamic toolbar item component
function getGroupItemComponent(item: Toolbar.GroupItem) {
  if (item.type === 'actionMenu') {
    return ActionMenuButton
  } else if (item.type === 'callback' || item.type === 'action') {
    return CallbackButton
  } else {
    throw "Unimplemented group item: " + item.type
  }
}
function getGroupItemComponentProps(item: Toolbar.GroupItem) {
   if (item.type === 'actionMenu') {
    return {
      menu: item as Toolbar.GroupActionMenu,
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