<!-- Modal for editing link properties. -->
<template>
  <FullscreenModal v-model="open" :can-confirm="true" :confirm-callback="confirm">
    <template #headerTitle>
      Edit link
    </template>
    <template #form>
      <FormGroupInputField v-model="link.href" label="URL" icon="material-symbols:link" :required="true" />
      <FormGroupInputField v-model="link.title" label="Title" help="Shown as a tooltip." icon="material-symbols:title" />
    </template>
    <template #footer>
      <IconButton class="btn-primary" icon="material-symbols:add-link" @click="confirm">Confirm</IconButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">

const emit = defineEmits<{
  confirm: [],
}>()

const link = defineModel('link', {
  default: {
    title: '',
    href: '',
  },
})

const open = defineModel('open', {
  default: false,
})

function confirm() {
  emit('confirm')
}

</script>