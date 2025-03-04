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
      <div v-for="group in editor.actionGroups">
        <h4>{{ group.name }}</h4>
        <hr class="mb-2" />
        <div class="flexcol gap-y-2">
          <EditorSettingsKeybind v-for="actionID in group.actions" :action="editor.getAction(actionID)" :keybind="editor.getActionKeybind(actionID)" @rebind="onRebindRequested"/>
        </div>
      </div>
    </template>
  </Modal>

  <!-- Action rebinding modal -->
  <UModal v-model="rebindingModalVisible" :overlay="true">
    <Modal @close="closeBindingModal">
      <template #headerTitle>
        <h3>Rebind {{ pendingRebindActionID }}</h3>
      </template>
      <template #form>
        <span class="flex gap-x-2">
          <span>Press the new keybind for {{ pendingRebindActionID }}:</span>
          <span v-if="pendingRebindKeybind"><UKbd class="badge badge-neutral">{{ keybindStringifier.stringify(pendingRebindKeybind) }}</UKbd></span>
          <span v-else>Unbound</span>
        </span>

        <p v-if="conflictingAction">The keybind is already in use by {{ conflictingAction }}; rebinding will clear the keybind for that action.</p>
      </template>
        <template #footer>
          <IconButton class="btn-primary" icon="i-heroicons-check-16-solid" @click="rebind">Rebind</IconButton>
          <IconButton class="btn-secondary" icon="i-heroicons-arrow-uturn-left" @click="closeBindingModal">Cancel</IconButton>
        </template>
    </Modal>
  </UModal>
</template>

<script setup lang="ts">
import * as Editor from '../../composables/editor/Editor'

const keybindStringifier = useKeybindStringifier()

const rebindingModalVisible = ref(false)
const pendingRebindActionID: Ref<Editor.actionID | null> = ref(null)
const pendingRebindKeybind: Ref<Editor.keyCombo | null> = ref(null)
const conflictingAction: Ref<Editor.actionID | null> = ref(null)

const props = defineProps<{
  editor: Editor.Editor,
}>()

const emit = defineEmits<{
  close: [],
  rebind: [Editor.actionID, Editor.keyCombo | null]
}>()

function rebind() {
  if (pendingRebindActionID.value) {
    emit('rebind', pendingRebindActionID.value, pendingRebindKeybind.value)
    rebindingModalVisible.value = false
    resetBindingModal()
  }
}

function closeBindingModal() {
  resetBindingModal()
  rebindingModalVisible.value = false
}

function resetBindingModal() {
  pendingRebindActionID.value = null
  pendingRebindKeybind.value = null
  conflictingAction.value = null
}

function onRebindRequested(actionID: string) {
  resetBindingModal()
  rebindingModalVisible.value = true
  pendingRebindActionID.value = actionID
}

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