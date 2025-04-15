<!-- Editor settings menu. -->
<template>
  <Modal @close="emit('close')">
    <template #headerTitle>
      <h2>Settings</h2>
    </template>
    <template #form>
      <!-- Keybinds -->
      <h3>Keybinds</h3>
      <!-- Groups -->
      <div v-for="group in toolbar.getToolbarGroups()">
        <h4>{{ group.name }}</h4>
        <hr class="mb-2" />
        <div class="flexcol gap-y-2">
          <EditorSettingsAction v-for="item in getGroupItems(group)" :item="item" :keybind="editor.getItemKeybind(item.id)" :canReset="!isKeybindDefault(item.id)" :is-visible-in-toolbar="toolbar.isItemVisible(item.id)" @rebind="onRebindRequested" @resetToDefault="onResetKeybind" @toggle-visibility="onToggleActionVisibility" />
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
import * as Toolbar from '~/src/editor/Toolbar'

const keybindStringifier = useKeybindStringifier()
const { editor, toolbar } = useEditorInjects()

const rebindingModalVisible = ref(false)
const pendingRebindItem: Ref<Toolbar.GroupItem | null> = ref(null)
const pendingRebindKeybind: Ref<Editor.keybind | null> = ref(null)
const conflictingAction: Ref<Editor.actionID | null> = ref(null)

const emit = defineEmits<{
  close: [],
  rebind: [Toolbar.actionGroupItemIdentifier, Editor.keybind | null]
}>()

function rebind() {
  if (pendingRebindItem.value) {
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

function getGroupItems(group: Toolbar.Group): Toolbar.GroupItem[] {
  const items: Toolbar.GroupItem[] = []
  for (const item of group.items) {
    if (item.type === 'action' || item.type === 'callback') {
      items.push(item)
    } else if (item.type === 'actionMenu') {
      // Add all subitems
      for (const subitem of (item as Toolbar.GroupActionMenu).subitems) {
        items.push(subitem)
      }
    }
  }
  return items
}

/** Returns whether an action's keybind is the default one. */
function isKeybindDefault(actionID: string) {
  const defaultKeybind = editor.value.getDefaultItemKeybind(actionID)
  const currentKeybind = editor.value.getItemKeybind(actionID)
  return defaultKeybind === currentKeybind
}

function onRebindRequested(item: Toolbar.GroupItem) {
  resetBindingModal()
  rebindingModalVisible.value = true
  pendingRebindItem.value = item
}

function onResetKeybind(item: Toolbar.GroupItem) {
  const defaultKeybind = editor.value.getDefaultItemKeybind(item)
  emit('rebind', item.id, defaultKeybind)
}

/** Sets visibility and saves preferences. */
function onToggleActionVisibility(item: Toolbar.GroupItem, visible: boolean) {
  toolbar.value.setItemVisible(item.id, visible)
  editor.value.savePreferences("ArticleEditor")
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