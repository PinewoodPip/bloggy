<!-- Editor settings menu. -->
<template>
  <Modal :set-padding="false" @close="emit('close')">
    <template #headerTitle>
      <h2>Settings</h2>
    </template>
    <template #form>
      <!-- Keybinds -->
      <h3 class="py-2 pb-0">Toolbar</h3>
      <!-- Groups -->
      <div v-for="group in tools.getToolPalette('toolbar').toolGroups" class="sticky">
        <div class="bg-base-100 z-10 sticky top-0">
          <h4 class="font-semibold py-1 pt-3">{{ group.name }}</h4>
          <FaintHr class="faint-hr mb-2" />
        </div>
        <div class="flexcol gap-y-2">
          <ArticleEditorModalSettingsAction v-for="item in getGroupItems(group)" :item="item" :keybind="editor.getToolKeybind(item.id)" :canReset="!isKeybindDefault(item.id)" :is-visible-in-toolbar="tools.isToolVisible(item.id)" @rebind="onRebindRequested" @resetToDefault="resetKeybind" @toggle-visibility="setActionVisibility" />
        </div>
      </div>
    </template>
  </Modal>

  <!-- Action rebinding modal -->
  <UModal v-model="rebindingModalVisible" :overlay="true">
    <Modal @close="closeBindingModal">
      <template #headerTitle>
        <h3>Rebind {{ pendingRebindActionName }}</h3>
      </template>
      <template #form>
        <span class="flex gap-x-2">
          <span>Press the new keybind for {{ pendingRebindActionName }}:</span>
          <span v-if="pendingRebindKeybind"><UKbd class="badge badge-neutral">{{ keybindStringifier.stringify(pendingRebindKeybind) }}</UKbd></span>
          <span v-else>Unbound</span>
        </span>

        <p v-if="conflictingAction">The keybind is already in use by {{ conflictingAction }}; rebinding will clear the keybind for that action.</p>
      </template>
        <template #footer>
          <IconButton class="btn-smp btn-primary" icon="i-heroicons-check-16-solid" @click="rebind">Rebind</IconButton>
          <IconButton class="btn-smp btn-secondary" icon="i-heroicons-arrow-uturn-left" @click="closeBindingModal">Cancel</IconButton>
        </template>
    </Modal>
  </UModal>
</template>

<script setup lang="ts">
import * as Editor from '~/src/editor/Editor'
import * as Tools from '~/src/editor/ToolManager'

const keybindStringifier = useKeybindStringifier()
const { editor, tools } = useEditorInjects()
const { getGroupItems, isKeybindDefault, resetKeybind, setItemVisibility: setActionVisibility, setItemKeybind } = useEditorSettings()

const rebindingModalVisible = ref(false)
const pendingRebindItem: Ref<Tools.Tool | null> = ref(null)
const pendingRebindKeybind: Ref<Editor.keybind | null> = ref(null)
const conflictingAction: Ref<Editor.actionID | null> = ref(null)

const emit = defineEmits<{
  close: [],
  rebind: [Tools.toolIdentifier, Editor.keybind | null]
}>()

/** Update the keybind of the selected item. */
function rebind() {
  if (pendingRebindItem.value) {
    setItemKeybind(pendingRebindItem.value, pendingRebindKeybind.value!)
    emit('rebind', pendingRebindItem.value.id, pendingRebindKeybind.value)
    rebindingModalVisible.value = false
  }
}

function closeBindingModal() {
  rebindingModalVisible.value = false
}

function resetBindingModal() {
  pendingRebindItem.value = null
  pendingRebindKeybind.value = null
  conflictingAction.value = null
}

function onRebindRequested(item: Tools.Tool) {
  resetBindingModal()
  rebindingModalVisible.value = true
  pendingRebindItem.value = item
}

const pendingRebindActionName = computed(() => {
  return pendingRebindItem.value ? pendingRebindItem.value.def.name : ''
})

// @ts-ignore
defineShortcuts(useArbitraryKeyshortcuts(
  (keys) => {
    pendingRebindKeybind.value = keys

    // Warn if the new keybind conflicts with an existing binding of another action
    const previousAction = editor.value.getItemForKeybind(keys)
    if (previousAction != null && previousAction.id !== pendingRebindItem.value?.id) {
      conflictingAction.value = previousAction.id
    }
  },
  (keys) => {
    // Only execute shortcuts when rebinding an action
    return pendingRebindItem.value != null
  }
))

</script>