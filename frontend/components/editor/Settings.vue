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
      <div v-for="group in editor.toolbarGroups">
        <h4>{{ group.name }}</h4>
        <hr class="mb-2" />
        <div class="flexcol gap-y-2">
          <EditorSettingsAction v-for="actionID in getGroupActions(group)" :action="editor.getAction(actionID)" :keybind="editor.getActionKeybind(actionID)" :canReset="!isKeybindDefault(actionID)" :is-visible-in-toolbar="editor.isActionVisibleInToolbar(actionID)" @rebind="onRebindRequested" @resetToDefault="onResetKeybind" @toggle-visibility="onToggleActionVisibility" />
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
import * as Editor from '../../composables/editor/Editor'

const keybindStringifier = useKeybindStringifier()

const rebindingModalVisible = ref(false)
const pendingRebindActionID: Ref<Editor.actionID | null> = ref(null)
const pendingRebindKeybind: Ref<Editor.keybind | null> = ref(null)
const conflictingAction: Ref<Editor.actionID | null> = ref(null)

const props = defineProps<{
  editor: Editor.Editor,
}>()

const emit = defineEmits<{
  close: [],
  rebind: [Editor.actionID, Editor.keybind | null]
}>()

function rebind() {
  if (pendingRebindActionID.value) {
    emit('rebind', pendingRebindActionID.value, pendingRebindKeybind.value)
    rebindingModalVisible.value = false
  }
}

function closeBindingModal() {
  rebindingModalVisible.value = false
}

function resetBindingModal() {
  pendingRebindActionID.value = null
  pendingRebindKeybind.value = null
  conflictingAction.value = null
}

function getGroupActions(group: Editor.ToolbarGroup): Editor.actionID[] {
  const actions: Editor.actionID[] = []
  for (const item of group.items) {
    if (item.type === 'action') {
      actions.push((item as Editor.ToolbarGroupAction).actionID)
    } else if (item.type === 'actionMenu') {
      for (const actionID of (item as Editor.ToolbarGroupActionMenu).actionIDs) {
        actions.push(actionID)
      }
    }
  }
  return actions
}

/** Returns whether an action's keybind is the default one. */
function isKeybindDefault(actionID: string) {
  const defaultKeybind = props.editor.getAction(actionID).getDefaultKeyCombo()
  const currentKeybind = props.editor.getActionKeybind(actionID)
  return defaultKeybind === currentKeybind
}

function onRebindRequested(actionID: string) {
  resetBindingModal()
  rebindingModalVisible.value = true
  pendingRebindActionID.value = actionID
}

function onResetKeybind(actionID: Editor.actionID) {
  const defaultKeybind = props.editor.getAction(actionID).getDefaultKeyCombo()
  emit('rebind', actionID, defaultKeybind)
}

/** Sets visibility and saves preferences. */
function onToggleActionVisibility(actionID: Editor.actionID, visible: boolean) {
  props.editor.setActionVisibleInToolbar(actionID, visible)
  props.editor.savePreferences("ArticleEditor")
}

const pendingRebindActionName = computed(() => {
  return pendingRebindActionID.value ? props.editor.getAction(pendingRebindActionID.value).def.name : ''
})

// @ts-ignore
defineShortcuts(useArbitraryKeyshortcuts(
  (keys) => {
    pendingRebindKeybind.value = keys

    // Warn if the new keybind conflicts with an existing binding of another action
    const previousAction = props.editor.getActionForKeybind(keys)
    if (previousAction != null && previousAction.def.id !== pendingRebindActionID.value) {
      conflictingAction.value = previousAction.def.id
    }
  },
  (keys) => {
    // Only execute shortcuts when rebinding an action
    return pendingRebindActionID.value != null
  }
))

</script>