<template>
  <AdminPage>
    <div class="large-content-block flexcol flex-grow h-full">
      <!-- Header -->
      <div class="flex justify-between">
        <h2>
          <UIcon name="i-material-symbols-book-2-outline" /> Content
        </h2>
        <p>Manage articles and categories.</p>
      </div>

      <hr />

      <div class="flex py-3">
        <!-- TODO search -->
        <IconedInput v-model="searchTerm" icon="i-heroicons-magnifying-glass" placeholder="Search..."/>

        <HorizontalFill/>

        <!-- Management buttons; redundant? It's more intuitive to create these by selecting the target category first. -->
        <!-- <div class="flex gap-x-2">
          <IconButton icon="i-heroicons-user-plus" class="btn-primary btn-sm" @click="addCategory">New category</IconButton>
          <IconButton icon="i-heroicons-user-plus" class="btn-primary btn-sm" @click="addArticle">New article</IconButton>
        </div> -->
      </div>

      <hr/>

      <!-- Content tree -->
      <div class="flex-grow overflow-x-auto">
        <div v-if="contentStatus == 'success' && contentTree" class="flexcol gap-y-2">
          <!-- Render root category; subcategories will be rendered recursively -->
          <AdminContentCategory :category="contentTree" @create-child="onCategoryCreateChildRequested" @edit="onCategoryEditRequested" />
        </div>
        <div v-else class="loading loading-spinner" />
      </div>
    </div>
  </AdminPage>

  <!-- Category creation form -->
  <UModal v-model="creationModalVisible" :overlay="true">
    <AdminContentCategoryCreationModal :parentCategoryPath="selectedCategoryPath" @created="onCategoryCreated" @close="creationModalVisible = false" />
  </UModal>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'

const categoryService = useCategoryService()

const searchTerm = ref("")
const creationModalVisible = ref(false)
const editCategoryModalOpen = ref(false)
const selectedCategoryPath: Ref<string> = ref('/')
const categoryBeingEdited: Ref<Category | null> = ref(null)

let idToCategory: {[key: categoryID]: Category} = {} // ID map since API gives a tree structure instead

function onCategoryCreateChildRequested(id: categoryID) {
  const category = getCategoryByID(id)
  // Open creation modal
  selectedCategoryPath.value = category.path
  creationModalVisible.value = true
}

// Refetch categories after management operations
function onCategoryCreated(category: Category) {
  refetchContentTree()
}

function getCategoryByID(id: categoryID): Category {
  return idToCategory[id]
}

/** Recursively maps category IDs to their object, for faster by-ID lookups. */
function mapCategory(category: Category) {
  idToCategory[category.id] = category
  for (const subcategory of category.subcategories) {
    mapCategory(subcategory)
  }
}

const { data: contentTree, status: contentStatus, refetch: refetchContentTree } = useQuery({
  queryKey: ["contentCategories"],
  queryFn: async () => {
    idToCategory = {} // Clear ID map; should be done before the fetch in case it fails - we don't want the map to contain stale data in that case
    const tree = await categoryService.getCategory('/')
    mapCategory(tree) // Create ID-to-object map
    return tree
  },
})

</script>