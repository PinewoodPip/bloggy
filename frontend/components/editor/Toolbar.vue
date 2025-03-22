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
              <component v-for="item in getVisibleGroupItems(group)" :is="getGroupItemComponent(item)" v-bind="getGroupItemComponentProps(item)" v-on="getGroupItemComponentEvents(item)" />
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
import * as Editor from '~/src/editor/Editor'
import ActionButton from './ActionButton.vue'
import ActionMenuButton from './ActionMenuButton.vue'

const { editor } = useEditorInjects()

const emit = defineEmits<{
  actionUse: [Editor.IAction]
}>()

const headerRef = useTemplateRef('header')
const headerParentRef = useTemplateRef('parent')

const floating = ref(false)

function useAction(action: Editor.IAction) {
  emit('actionUse', action)
}

/** Toolbar groups to show, based on user preferences. */
const visibleGroups = computed(() => {
  const groups: Editor.ToolbarGroup[] = []
  for (const group of editor.value.getToolbarGroups()) {
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
      visible = editor.value.isActionVisibleInToolbar((item as Editor.ToolbarGroupAction).actionID)
    } else if (item.type === 'actionMenu') {
      const menuActions = (item as Editor.ToolbarGroupActionMenu).actionIDs
      visible = ArrayUtils.anyInArray(menuActions, (actionID) => {
        return editor.value.isActionVisibleInToolbar(actionID)
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
      action: editor.value.getAction((item as Editor.ToolbarGroupAction).actionID),
    }
  } else if (item.type === 'actionMenu') {
    return {
      menu: item as Editor.ToolbarGroupActionMenu,
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