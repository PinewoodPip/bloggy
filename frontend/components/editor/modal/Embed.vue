<!-- Modal for inserting embeds to external site content. -->
<template>
  <FullscreenModal v-model="openModel" :can-confirm="canConfirm" :confirm-callback="confirm">
    <template #headerTitle>
      {{ isEditing ? 'Edit' : 'Insert' }} embed
    </template>
    <template #form>
      <FormGroupInputField v-model="embed.url" label="URL" hint="Content URL." icon="material-symbols:link" :error="urlErrorLabel" />
    </template>
    <template #footer>
      <IconButton class="btn-primary" icon="material-symbols:add-link" :disabled="!canConfirm" @click="confirm">Confirm</IconButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import { useMediaEmbeds } from '~/composables/Embeds';
import type { EmbedAttrs } from '~/src/editor/Editor';

const mediaUtils = useMediaEmbeds()

const emit = defineEmits<{
  confirm: [EmbedAttrs],
}>()

const embed = reactive({
  type: '',
  url: '',
})

const openModel = defineModel('open', {
  default: false,
})
const isEditing = ref(false)

/** Opens the modal. Attrs may be provided to edit an existing embed's attrs. */
function open(attrs?: EmbedAttrs) {
  // Reset values
  embed.type = ''
  embed.url = ''

  // Copy attrs from params
  if (attrs) {
    embed.type = attrs.type
    embed.url = mediaUtils.getUserFriendlyURL(attrs.type, attrs.contentID)!
  }
  isEditing.value = attrs !== undefined

  openModel.value = true
}
defineExpose({
  open,
})

function confirm() {
  openModel.value = false
  emit('confirm', {
    // Non-null due to the canConfirm check.
    type: urlType.value!,
    contentID: contentID.value!,
  })
}

const canConfirm = computed(() => {
  return urlType.value !== null
})

/** The ID of the service the URL corresponds to, if any. */
const urlType = computed(() => {
  return mediaUtils.getServiceType(embed.url)
})

const urlErrorLabel = computed(() => {
  const url = embed.url
  if (url && urlType.value === null) {
    return 'Unknown embed source URL'
  }
  return undefined
})

/** The site-specific content ID within the URL. */
const contentID = computed(() => {
  return mediaUtils.getContentID(embed.url)
})

</script>