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
          <AdminContentCategory :category="contentTree" :relevantItems="relevantItems" @create-child="onCategoryCreateChildRequested" @edit="onCategoryEditRequested" @edit-article="onArticleEditRequested" />
        </div>
        <div v-else class="loading loading-spinner" />
      </div>
    </div>
  </AdminPage>

  <!-- Category creation form -->
  <UModal v-model="creationModalVisible" :overlay="true">
    <AdminContentCategoryCreationModal :parentCategoryPath="selectedCategoryPath" @created="onCategoryCreated" @close="creationModalVisible = false" />
  </UModal>

  <!-- Category edit form -->
  <div v-if="categoryBeingEdited">
    <AdminContentCategoryEditModal v-model="editCategoryModalOpen" :category="categoryBeingEdited" @edit="onCategoryEdited" />
  </div>
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

function onCategoryEditRequested(id: categoryID) {
  const category = getCategoryByID(id)
  // Open editing modal
  categoryBeingEdited.value = category
  editCategoryModalOpen.value = true
}

function onArticleEditRequested(id: articleID) {
  // TODO
}

// Refetch categories after management operations
function onCategoryEdited(category: Category) {
  refetchContentTree()
}
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

/** Set of IDs of categories and articles relevant to the search term. */
const relevantItems = computed(() => {
  const relevantObjects: ContentPanelRelevantSearchItems = {
    CategoryIDs: new Set(),
    ArticleIDs: new Set(),
  }
  if (contentTree.value) {
    addRelevantItems(relevantObjects, contentTree.value)
    relevantObjects.CategoryIDs.add(contentTree.value.id) // Always include the root category
  }
  return relevantObjects
})

/** Recursively marks the category, subcategories and articles as relevant to the search term. */
function addRelevantItems(relevantObjects: ContentPanelRelevantSearchItems, category: Category) {
  let categoryIsRelevant = isCategoryRelevantToSearch(category)
  let hasRelevantArticles = false
  for (const article of category.articles) {
    if (categoryIsRelevant || isArticleRelevantToSearch(article)) {
      relevantObjects.ArticleIDs.add(article.id)
      hasRelevantArticles = true
    }
  }
  // The category is also relevant is any of its articles is.
  if (categoryIsRelevant || hasRelevantArticles) {
    relevantObjects.CategoryIDs.add(category.id)
  }
  // Update subcategories recursively
  for (const subcategory of category.subcategories) {
    addRelevantItems(relevantObjects, subcategory)
  }
}

function isCategoryRelevantToSearch(category: Category): boolean {
  const name = category.name.toLocaleLowerCase()
  const directory = category.directory_name.toLocaleLowerCase()
  let relevant = name.includes(searchTerm.value) || directory.includes(searchTerm.value)
  if (!relevant) {
    // Search in subcategories; the category will also be considered relevant if any child is, so the tree can be displayed properly
    for (const subcategory of category.subcategories) {
      relevant = isCategoryRelevantToSearch(subcategory)
      if (relevant) break;
    }
  }
  return relevant
}

function isArticleRelevantToSearch(article: ArticlePreview): boolean {
  const title = article.title.toLocaleLowerCase()
  const filename = article.filename.toLocaleLowerCase()
  return title.includes(searchTerm.value) || filename.includes(searchTerm.value)
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