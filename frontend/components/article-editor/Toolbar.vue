<!-- Action toolbar. -->
<template>
  <div ref="parent">
    <div ref="header" class="top-0 z-50">
      <div class="small-content-block flex">
        <div class="flex p-2 overflow-x-auto">
          <!-- Action groups -->
          <div v-for="group in visibleGroups" class="flex">
            <!-- Actions of the group -->
            <div class="flex gap-x-2">
              <component v-for="item in getVisibleGroupItems(group)" :is="getGroupItemComponent(item)" v-bind="getGroupItemComponentProps(item)" />
            </div>
            <!-- Should be outside the actions container to avoid applying gap to it -->
            <div class="divider divider-horizontal mx-1"/>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="floating" :style="{'margin-top': `${headerRef?.offsetHeight}px`}" />
</template>

<script setup lang="ts">
import * as Toolbar from '~/src/editor/Toolbar'
import CallbackButton from '~/components/article-editor/menu/CallbackButton.vue'
import ActionMenuButton from '~/components/article-editor/menu/ActionMenuButton.vue'

const { visibleGroups, getVisibleGroupItems } = useEditorToolbarItems()

const headerRef = useTemplateRef('header')
const headerParentRef = useTemplateRef('parent')

const floating = ref(false)

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

/**
 * Automatically sets the toolbar to be fixed-positioned when the window is scrolled past it.
 * Taken from prosemirror-example-setup
 */
 function scrollListener() {
  let menu = headerRef.value!
  let parent = headerParentRef.value!
  let editorRect = parent.getBoundingClientRect()
  if (floating.value) {
    if (editorRect.top >= 0 || editorRect.bottom >= 0) {
      floating.value = false
      menu.style.position = menu.style.left = menu.style.top = menu.style.width = ""
      menu.style.position = ""
    } else {
      menu.style.display = editorRect.top > (window).innerHeight
        ? "none" : ""
    }
  } else {
    if (editorRect.top < 0) {
      floating.value = true
      let menuRect = menu.getBoundingClientRect()
      menu.style.left = menuRect.left + "px"
      menu.style.width = menuRect.width + "px"
      menu.style.position = "fixed"
    }
  }
}

// Register and cleanup scroll listeners
onUnmounted(() => {
  window.removeEventListener('scroll', scrollListener)
})
onMounted(() => {
  window.addEventListener('scroll', scrollListener)
})

</script>