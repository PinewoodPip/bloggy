<template>
  <FullscreenModal v-model="model">
    <template #headerTitle>
      <h2>Edit category</h2>
    </template>

    <template #form>
      <!-- Title -->
      <FormGroupInputField v-model="patchData.name" label="Name" help="User-friendly title" icon="i-material-symbols-title" />
      
      <!-- Directory name -->
      <!-- TODO preview path in help -->
      <FormGroupInputField v-model="patchData.directory_name" label="Directory name" help="Determines the URL of the category" icon="i-material-symbols-link" />
      
      <!-- Sorting mode -->
      <FormGroupSelect v-model="patchData.sorting_type" :options="sortingOptions" label="Article sorting" help="Determines how articles are sorted when browsing the category." icon="i-material-symbols-sort" />
      <!-- View mode -->
      <FormGroupSelect v-model="patchData.view_type" :options="viewOptions" label="Article display" help="Determines how articles are displayed when browsing the category." icon="i-material-symbols-screenshot-monitor-outline" />
    </template>

    <template #footer>
      <MutationButton class="btn-primary" :status="patchingStatus" :disabled="!canConfirm" @click="confirm">Save</MutationButton>
    </template>
  </FullscreenModal>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query';
import type { ModelRef } from 'vue';

const categoryService = useCategoryService()
const responseToast = useResponseToast()

const props = defineProps<{
  category: Category,
}>()

const emit = defineEmits<{
  edit: [Category],
}>()

const model: ModelRef<boolean> = defineModel({
  default: false,
})

const patchData = reactive({
  name: '',
  directory_name: '',
  view_type: 'vertical',
  sorting_type: 'chronological',
  // parent_category_path: '/', // TODO allow changing parent
})

// Combobox options
const sortingOptions = [
  {
    id: 'chronological',
    label: 'Chronological',
  },
  {
    id: 'manual',
    label: 'Manual',
  },
]
const viewOptions = [
  {
    id: 'vertical',
    label: 'Blog-like',
  },
  {
    id: 'grid',
    label: 'Card grid',
  },
]

function confirm() {
  requestPatch(patchData as CategoryUpdateRequest)
}

const canConfirm = computed(() => {
  return true // TODO validate fields
})

// Set default field values when the category prop is set
watchEffect(() => {
  if (props.category) {
    const category = props.category
    patchData.name = category.name
    patchData.directory_name = category.directory_name
    patchData.view_type = category.view_type
    patchData.sorting_type = category.sorting_type
    // patchData.parent_category_path = category.path // TODO
  }
})

/** Query for patching the category */
const { mutate: requestPatch, status: patchingStatus } = useMutation({
  mutationFn: (request: CategoryUpdateRequest) => {
    return categoryService.updateCategory(props.category.path, request)
  },
  onSuccess: (category) => {
    emit('edit', category)
    model.value = false // Close the modal
  },
  onError: (err) => {
    responseToast.showError('Failed to edit category', err)
  }
})

defineShortcuts({
  // Enter key submits the form
  enter: {
    usingInput: true,
    whenever: [canConfirm],
    handler: () => {
      confirm()
    },
  }
})

</script>