<!-- Modal for creating categories. -->
<template>
  <Modal @close="emit('close')">
    <template #headerTitle>
      <h2>Create category</h2>
    </template>

    <template #form>
      <!-- Title -->
      <FormGroupInputField v-model="categoryName" placeholder="New category" icon="i-heroicons-user" label="Name" help="User-friendly name" required />
      <!-- Directory name -->
      <FormGroupInputField v-model="categoryDirectoryName" placeholder="new_category" icon="i-heroicons-user" label="Directory name" :help="directoryNameHelp" required />
    </template>

    <template #footer>
      <!-- Confirm button -->
      <IconButton class="btn-primary" icon="i-heroicons-user-plus" :disabled="creationStatus === 'pending' || !canCreate" @click="create">
        <span v-if="creationStatus === 'pending'" class="loading loading-spinner" />
        <span v-else>Create</span>
      </IconButton>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import type { AxiosError } from 'axios';

const categoryService = useCategoryService()
const errorStringifier = useResponseStringifier()
const toast = useToast()

const categoryName = ref('')
const categoryDirectoryName = ref('')

const props = defineProps<{
  parentCategoryPath: string,
}>()

const emit = defineEmits<{
  created: [Category],
  close: [],
}>()

function create() {
  requestCreation({
    name: categoryName.value,
    directory_name: categoryDirectoryName.value,
    parent_category_path: props.parentCategoryPath,
  })
}

const canCreate = computed(() => {
  return categoryName.value !== '' && categoryDirectoryName.value !== '' // TODO recreate validation reqs from backend
})

const directoryNameHelp = computed(() => {
  return categoryDirectoryName.value !== '' ? `URL will be ${props.parentCategoryPath !== '/' ? props.parentCategoryPath : ''}/${categoryDirectoryName.value}` : 'Determines the category\'s URL'
})

/** Query for creating the category */
const { mutate: requestCreation, status: creationStatus } = useMutation({
  mutationFn: (request: CategoryCreationRequest) => {
    return categoryService.createCategory(request)
  },
  onSuccess: (category) => {
    emit('created', category)
    emit('close')
  },
  onError: (err) => {
    toast.add({title: "Failed to create category", description: errorStringifier.stringify(err as AxiosError), color: "red"})
  }
})

defineShortcuts({
  // Enter key submits the form
  enter: {
    usingInput: true,
    whenever: [canCreate],
    handler: () => {
      create()
    },
  }
})

</script>