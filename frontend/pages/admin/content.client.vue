<template>
  <AdminPage header="Content" icon="i-material-symbols-book-2-outline" hint="Manage articles and categories.">
    <div class="flex py-3">
      <IconedInput v-model="searchTerm" icon="i-heroicons-magnifying-glass" placeholder="Search..."/>

      <HorizontalFill/>

      <!-- Management buttons; redundant? It's more intuitive to create these by selecting the target category first. -->
      <div class="flex gap-x-2">
        <IconButton icon="material-symbols:create-new-folder" class="btn-primary btn-smp" @click="onCategoryCreateChildRequested(contentTree!)">New category</IconButton>
        <UTooltip :text="!canCreateArticles ? 'Only editor accounts can create articles.' : ''">
          <IconButton icon="material-symbols:article" class="btn-primary btn-smp" :disabled="!canCreateArticles" @click="onArticleCreateRequested(contentTree!)">New article</IconButton>
        </UTooltip>
      </div>
    </div>

    <hr class="mb-2"/>

    <!-- Content tree -->
    <div class="flex-grow overflow-x-auto">
      <div v-if="contentStatus == 'success' && contentTree" class="flexcol gap-y-2">
        <!-- Render root category; subcategories will be rendered recursively -->
        <AdminTreeItem :key="contentTree.id" :item="contentTree" @click="onArticleClick">
          <!-- Author avatar icons -->
          <template #label="{ item: childItem }">
            <!-- Will uncondense on hover -->
            <div v-if="childItem.authors" class="avatar-group hover:space-x-0 -space-x-3">
              <UTooltip v-for="author in childItem.authors" :key="author.id" :text="`Authored by ${author.display_name}`">
                <UserAvatar :user="author" class="size-8" />
              </UTooltip>
            </div>
          </template>
          
          <!-- Buttons -->
          <template #buttons="{ canCreateNode, canCreateLeaf, canEdit, item: childItem }">
            <!-- Create node button -->
            <UTooltip v-if="canCreateNode" :text="'Create folder' +  childItem.id">
              <IconButton class="btn-sm btn-secondary" icon="material-symbols:create-new-folder" @click.stop="onCategoryCreateChildRequested(childItem)" />
            </UTooltip>
            <!-- Create leaf button -->
            <UTooltip v-if="canCreateLeaf" :text="canCreateArticles ? 'Create article' : 'Only editor accounts can create articles.'">
              <IconButton class="btn-sm btn-secondary" icon="material-symbols:add-notes" @click.stop="onArticleCreateRequested(childItem)" :disabled="!canCreateArticles" />
            </UTooltip>
            <!-- Edit button -->
            <UTooltip v-if="canEdit" text="Edit">
              <IconButton class="btn-sm btn-secondary" icon="i-material-symbols-edit-outline" @click.stop="onNodeEditRequested(childItem)" />
            </UTooltip>
          </template>
        </AdminTreeItem>
      </div>
      <div v-else class="loading loading-spinner" />
    </div>
  </AdminPage>

  <!-- Category creation form -->
  <UModal v-model="categoryCreationModalVisible" :overlay="true">
    <AdminContentCategoryCreationModal :parentCategoryPath="selectedCategoryPath" @created="onContentChanged" @close="categoryCreationModalVisible = false" />
  </UModal>

  <!-- Category edit form -->
  <div v-if="categoryBeingEdited">
    <AdminContentCategoryEditModal v-model="editCategoryModalOpen" :category="categoryBeingEdited" @edit="onContentChanged" />
  </div>

  <!-- Article creation form -->
  <AdminContentArticleCreationModal v-model="articleCreationModalVisible" :category-path="selectedCategoryPath" @create="onArticleCreated" />

  <!-- Article edit form -->
  <div v-if="articleBeingEdited && articleToEdit">
    <AdminContentArticleEditModal v-model="articleEditModalVisible" :category-path="selectedCategoryPath" :article="articleToEdit" @update="onContentChanged" />
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { TreeItemGetters } from '~/components/admin/TreeItem.vue'

interface ContentPanelRelevantSearchItems {
  CategoryIDs: Set<categoryID>,
  ArticleIDs: Set<articleID>,
}

const categoryService = useCategoryService()
const articleService = useArticleService()
const responseToast = useResponseToast()
const userService = useUserService()
const user = useLoggedInUser()
const router = useRouter()
const { data: contentTree, status: contentStatus, refetch: refetchContentTree } = useContentTree()
const nodeGetters = useContentTreeGetters()
provide<TreeItemGetters<Category, ArticlePreview>>('siteFileTree', nodeGetters)

const searchTerm = ref("")
const categoryCreationModalVisible = ref(false)
const editCategoryModalOpen = ref(false)
const articleCreationModalVisible = ref(false)
const articleEditModalVisible = ref(false)
const selectedCategoryPath: Ref<string> = ref('/')
const categoryBeingEdited: Ref<Category | null> = ref(null)
const articleBeingEdited: Ref<ArticlePreview | null> = ref(null)
const idToCategory: Ref<{[key: categoryID]: Category}> = ref({}) // ID map since API gives a tree structure instead

function onCategoryCreateChildRequested(category: Category) {
  // Open creation modal
  selectedCategoryPath.value = category.path
  categoryCreationModalVisible.value = true
}

function onArticleCreateRequested(category: Category) {
  selectedCategoryPath.value = category.path
  articleCreationModalVisible.value = true
}

function onCategoryEditRequested(category: Category) {
  // Open editing modal
  categoryBeingEdited.value = category
  editCategoryModalOpen.value = true
}

function onNodeEditRequested(node: Category | ArticlePreview) {
  if ('filename' in node) {
    node = node as ArticlePreview
    onArticleEditRequested(node.category_id, node)
  } else {
    node = node as Category
    onCategoryEditRequested(node)
  }
}

function onArticleEditRequested(categoryID: categoryID, article: ArticlePreview) {
  const category = getCategoryByID(categoryID)
  // Open editing modal
  selectedCategoryPath.value = category.path
  articleBeingEdited.value = article
  refetchArticleToEdit()
}

function onArticleClick(node: Category | ArticlePreview) {
  if (nodeGetters.getNodeType(node) === 'leaf') {
    // Open editor for the article
    node = node as ArticlePreview
    router.push('/admin/editor/?article=' + node.path)
  }
}

/** Redirect to article editor upon creating a new article. */
function onArticleCreated(article: Article) {
  router.push('/admin/editor?article=' + article.path)
}

// Refetch categories and articles after management operations
function onContentChanged() {
  refetchContentTree()
  articleBeingEdited.value = null
}

function getCategoryByID(id: categoryID): Category {
  return idToCategory.value[id]
}

/** Recursively maps category IDs to their object, for faster by-ID lookups. */
function mapCategory(category: Category) {
  idToCategory.value[category.id] = category
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

/** Whether the user can create articles. */
const canCreateArticles = computed(() => {
  return user.data.value ? userService.isEditor(user.data.value) : false
})


// Refresh ID map when content changes
watchEffect(() => {
  idToCategory.value = {} // Clear ID map; should be done before the fetch in case it fails - we don't want the map to contain stale data in that case
  if (contentTree.value) { 
    mapCategory(contentTree.value) // Create ID-to-object map
  }
})

/** Query for fetching full data of the article to edit */
const { data: articleToEdit, status: articleToEditStatus, refetch: refetchArticleToEdit } = useQuery({
  queryKey: ["articleToEdit"],
  queryFn: async () => {
    if (articleBeingEdited.value) {
      try {
        const article = await articleService.getArticle(selectedCategoryPath.value + '/' + articleBeingEdited.value?.filename)
        articleEditModalVisible.value = true // Show modal
        return article
      } catch (err) {
        responseToast.showError('Failed to load article to edit', err as object)
      }
    }
    return null
  },
})

</script>