<template>
  <div class="flexcol select-none">
    <!-- The item itself; toggles children visibility on click -->
    <div class="group flex items-center hover:bg-secondary/50 rounded-btn cursor-pointer p-1" @click="onClick">
      <div class="flex gap-x-2">
        <!-- Folder icon indicates open/collapsed state. Leaf items always show as open -->
        <UIcon class="size-6" :name="icon" />

        <!-- Path and title -->
        <UTooltip :text="getters.getTooltip(item)">
          <template v-if="tooltipComponent" #text>
            <component :is="tooltipComponent.component" v-bind="tooltipComponent.props" />
          </template>
          <p>{{ getters.getName(item) }}</p>
        </UTooltip>

        <!-- TODO slot for extra icons -->
      </div>

      <HorizontalFill />

      <!-- Management buttons; stop modifier prevents clicks from also toggling children -->
      <div class="invisible group-hover:visible flex gap-x-2">
        <!-- Create node button -->
        <UTooltip v-if="getters.canCreateNode(item as Node)" text="Create folder">
          <IconButton class="btn-sm btn-secondary" icon="material-symbols:create-new-folder" :override-height="true" @click.stop="emit('createNode', item as Node)" />
        </UTooltip>
        <!-- Create leaf button -->
        <UTooltip v-if="getters.canCreateLeaf(item as Node)" text="Create item">
          <IconButton class="btn-sm btn-secondary" icon="material-symbols:add-notes" :override-height="true" @click.stop="emit('createLeaf', item as Node)" />
        </UTooltip>
        <!-- Edit button -->
        <UTooltip v-if="canEdit" text="Edit">
          <IconButton class="btn-sm btn-secondary" icon="i-material-symbols-edit-outline" :override-height="true" @click.stop="emit('edit', item)" />
        </UTooltip>
      </div>
    </div>

    <!-- Padding creates a nested tree appearance -->
    <div v-if="!collapsed && hasChildren" class="flex pl-3 flex-grow">
      <div class="border-l border-l-neutral/30 mx-1 my-2" />
      <div class="flexcol flex-grow">
        <!-- Child nodes; events must be propagated to root -->
        <TreeItem v-for="child in children" :item="child" v-on="onEvent" />
        
        <!-- Leafs -->
        <TreeItem v-for="child in leafs" :item="child" v-on="onEvent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="Node extends object, Leaf extends Object">

/** Getters intended to be injected to define properties of the tree's nodes. */
export type TreeItemGetters<Node, Leaf> = {
  getNodeType: (obj: Node | Leaf) => "node" | "leaf",
  getChildrenNodes: (obj: Node) => Node[],
  getChildrenLeafs: (obj: Node) => Leaf[],
  getName: (obj: Node | Leaf) => string,
  getTooltip: (obj: Node | Leaf) => string,
  canCreateLeaf: (obj: Node) => boolean,
  canCreateNode: (obj: Node) => boolean,
  canEditNode: (node: Node) => boolean,
  canEditLeaf: (leaf: Leaf) => boolean,
  canDeleteNode: (node: Node) => boolean,
  canDeleteLeaf: (leaf: Leaf) => boolean,
  /** Allows customizing the tooltip element by the name of the item. */
  getTooltipComponent?: (node: Node | Leaf) => DynamicComponentDef | null,
  leafIcon: string,
  canCollapse?: boolean,
}

const getters = inject<TreeItemGetters<Node, Leaf>>('siteFileTree')!

const props = defineProps<{
  item: Node | Leaf,
}>()

const emit = defineEmits<{
  createLeaf: [Node],
  createNode: [Node],
  edit: [Node | Leaf],
  click: [Node | Leaf],
}>()

const children = computed(() => {
  return getters.getChildrenNodes(props.item as Node)
})

function onClick() {
  if (hasChildren.value && getters.canCollapse) {
    collapsed.value = !collapsed.value
  }
  emit('click', props.item)
}

const onEvent = {
  // @ts-ignore
  createLeaf: (...args) => {emit('createLeaf', ...args)},
  // @ts-ignore
  createNode: (...args) => {emit('createNode', ...args)},
  // @ts-ignore
  edit: (...args) => {emit('edit', ...args)},
  // @ts-ignore
  click: (...args) => {emit('click', ...args)},
}

const tooltipComponent = computed(() => {
  return getters.getTooltipComponent ? getters.getTooltipComponent(props.item) : null
})

const icon = computed(() => {
  if (nodeType.value === 'node') {
    return collapsed.value ? 'material-symbols:folder' : 'material-symbols:folder-open'
  } else {
    return getters.leafIcon
  }
})

const leafs = computed(() => {
  return nodeType.value == 'node' ? getters.getChildrenLeafs(props.item as Node) : []
})

const collapsed = ref(false)

const nodeType = computed(() => {
  return getters.getNodeType(props.item)
})

const canEdit = computed(() => {
  return nodeType.value == 'leaf' ? getters.canEditLeaf(props.item as Leaf) : getters.canEditNode(props.item as Node)
})

const hasChildren = computed(() => {
  return children.value.length > 0 || leafs.value.length > 0
})

</script>