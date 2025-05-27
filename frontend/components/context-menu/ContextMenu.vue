<template>
  <UContextMenu v-model="model" :virtual-element="virtualElement" @click.stop="">
    <Dropdown data-nuxtui-contextmenu-dropdown :items="items" v-model:open="model" :popper="{ placement: 'bottom-start' }">
      <div></div>
    </Dropdown>
  </UContextMenu>
</template>

<script setup lang="ts">
import { useMouse, useWindowScroll } from '@vueuse/core'

const { x, y } = useMouse()
const { y: windowY } = useWindowScroll()
const virtualElement = ref({ getBoundingClientRect: () => ({}) })
const { editorView, editorState } = useEditorInjects()

watch(editorState, () => {
  if (!editorState.value) return
  model.value = false
})

const props = defineProps<{
  items: object[][], // TODO annotate
}>()

const model = defineModel({
  default: false,
})

function onClick() {
  model.value = false
}

onMounted(() => {
  document.addEventListener('click', onClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onClick)
})

// Position the context menu when it is opened
watch(model, () => {
  if (!model) return; // Do nothing if the menu is being closed
  const top = unref(y) - unref(windowY)
  const left = unref(x)

  virtualElement.value.getBoundingClientRect = () => ({
    width: 0,
    height: 0,
    top,
    left
  })
})

// Escape shortcut to close
defineShortcuts({
  escape: {
    usingInput: true,
    whenever: [model],
    handler: () => {
      model.value = false
    },
  }
})

</script>