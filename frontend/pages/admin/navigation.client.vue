<template>
  <AdminPage header="Navigation" icon="material-symbols:assistant-navigation-outline" hint="Manage the site's navigation bar configuration.">
    <div class="flex py-3">
      <HorizontalFill/>

      <!-- "Add item" button -->
      <IconButton class="btn-primary btn-md" icon="material-symbols:upload" @click="onNewNodeRequested">Add item</IconButton>
    </div>

    <hr/>

    <!-- Navigation tree -->
    <AdminTreeItem v-for="node in schema.root_nodes" :item="node" @edit="onNodeEditRequested" @create-node="onCreateGroupRequested" @create-leaf="onCreateChildRequested" />

    <hr class="my-2" />

    <!-- Save button -->
    <MutationButton class="max-w-lg mx-auto" icon="material-symbols:save" :status="patchStatus" @click="applyChanges">Save</MutationButton>
  </AdminPage>

  <AdminModalNavigationNodeEditor ref="nodeModal" @confirm="onNodeCreationCompleted" />
</template>

<script setup lang="ts">
import { useMutation, useQuery } from '@tanstack/vue-query'
import type { Reactive } from 'vue'
import type { TreeItemGetters } from '~/components/admin/TreeItem.vue'
import type { Navigation, NavigationArticle, NavigationCategory, NavigationNode, NavigationNodeGroup, NavigationNodeGroupInput, NavigationNodeInput, NavigationUpdate, SiteConfigUpdate } from '~/services/site'

const siteService = useSiteService()
const responseToast = useResponseToast()
const nodeModal = useTemplateRef('nodeModal')

// Provide getters for TreeItems
provide<TreeItemGetters<NavigationNodeGroupInput, NavigationNodeInput>>('siteFileTree', {
  leafIcon: "material-symbols:article",

  getNodeType(node: NavigationNodeInput) {
    return node.type == 'group' ? 'node' : 'leaf'
  },
  getTooltip(node: NavigationNodeInput) {
    switch (node.type) {
      case 'article': {
        return node.article_filename
      }
      case 'category': {
        return node.category_path
      }
      case 'external_url': {
        return node.title
      }
      case 'group': {
        return node.name
      }
      default: {
        return 'Unknown'
      }
    }
  },
  getChildrenNodes(file: NavigationNodeInput) {
    if (file.type !== 'group') return []
    return (file as NavigationNodeGroupInput).children.filter((child) => {
      return child.type === 'group'
    })
  },
  getChildrenLeafs(tree: NavigationNodeInput) {
    if (tree.type !== 'group') return []
    return (tree as NavigationNodeGroupInput).children.filter((child) => {
      return child.type !== 'group'
    })
  },
  getName(tree: NavigationNodeInput) {
    return this.getTooltip(tree)
  },
  canCreateLeaf(node: NavigationNodeInput) {
    return node.type === 'group'
  },
  canCreateNode(node: NavigationNodeInput) {
    return node.type === 'group'
  },
  canEditNode() {
    return true
  },
  canDeleteNode() {
    return true
  },
  canEditLeaf() {
    return true
  },
  canDeleteLeaf() {
    return true
  },
})

const { data: config, status: configStatus } = useSiteConfig()

/** The navigation tree model. */
const schema: Reactive<NavigationUpdate> = reactive({
  root_nodes: [],
})

/** Node to parent new nodes into. If null, new nodes will be added at root. */
const targetParentNode: Ref<NavigationNodeGroupInput | null> = ref(null)
const nodeBeingEdited: Ref<NavigationNodeInput | null> = ref(null)

/** Sends a PATCH request to update the site's navigation. */
function applyChanges() {
  requestPatch(schema)
}

/** Opens the modal to create a new node. */
function onNewNodeRequested() {
  nodeModal.value?.open()
}

// Handle edit/creation requests
function onNodeEditRequested(node: NavigationNodeInput) {
  nodeBeingEdited.value = node as NavigationNodeGroupInput
  nodeModal.value?.edit(nodeBeingEdited.value)
}
function onCreateGroupRequested(node: NavigationNodeInput) {
  targetParentNode.value = node as NavigationNodeGroupInput
  nodeModal.value?.open('group')
}
function onCreateChildRequested(node: NavigationNodeInput) {
  targetParentNode.value = node as NavigationNodeGroupInput
  nodeModal.value?.open()
}

/** Adds a new node to the schema or edits an existing one. */
function onNodeCreationCompleted(node: NavigationNodeInput) {
  if (nodeBeingEdited.value) {
    // Edit existing node
    Object.assign(nodeBeingEdited.value, node)
  } else {
    // Push new node
    if (targetParentNode.value) {
      // Push to group children
      targetParentNode.value.children.push(node)
    } else {
      // Push at root
      schema.root_nodes.push({...node})
    }
  }
}

// Update model from API query
function updateModel() {
  if (config.value) {
    schema.root_nodes = config.value.navigation.root_nodes.map((subnode) => {
      return convertNavigationNodeToInput(subnode)
    })
  }
}
onMounted(() => {
  updateModel()
})
watch(config, () => {
  updateModel()
})

/** Converts an output navigation node schema to an input/update one. */
function convertNavigationNodeToInput(node: NavigationNode): NavigationNodeInput {
  switch (node.type) {
    case 'article': {
      return {
        type: 'article',
        category_path: node.article.category_path,
        article_filename: node.article.filename,
      }
    }
    case 'category': {
      return {
        type: 'category',
        category_path: node.category.path,
      }
    }
    case 'external_url': {
      return {...node} // Must copy to ensure the object is not read-only.
    }
    case 'group': {
      return {
        type: 'group',
        children: node.children.map((subnode => {
          return convertNavigationNodeToInput(subnode)
        })),
        name: node.name,
      }
    }
    default: {
      throw "Unsupported node type"
    }
  }
}

/** Query for updating the navigation config. */
const { mutate: requestPatch, status: patchStatus } = useMutation({
  mutationFn: (request: NavigationUpdate) => {
    return siteService.updateSiteConfig({
      navigation: request,
    })
  },
  onSuccess: (article) => {
    responseToast.showSuccess('Navigation updated')
  },
  onError: (err) => {
    responseToast.showError('Failed to update navigation', err)
  }
})

</script>