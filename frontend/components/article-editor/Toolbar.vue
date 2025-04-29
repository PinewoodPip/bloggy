<!-- Action toolbar. -->
<template>
  <div ref="parent">
    <div ref="header" class="top-0 z-50">
      <div class="small-content-block flex">
        <SimpleEditorToolbar />
      </div>
    </div>
  </div>
  <div v-if="floating" :style="{'margin-top': `${headerRef?.offsetHeight}px`}" />
</template>

<script setup lang="ts">

const headerRef = useTemplateRef('header')
const headerParentRef = useTemplateRef('parent')

const floating = ref(false)

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