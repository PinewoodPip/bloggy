<template>
  <div class="flexcol" tabindex="1" @keydown.enter="onClick">
    <!-- The item itself; toggles children visibility on click -->
    <div class="group flex items-center active:bg-secondary/80 rounded-btn cursor-pointer p-1" :class="extraContainerClasses" @click="onClick">
      <div class="flex items-center gap-x-2">
        <!-- Folder icon indicates open/collapsed state. Leaf items always show as open -->
        <UIcon class="size-6" :name="icon" />

        <!-- Path and title -->
        <UTooltip :text="getters.getTooltip(item)" :popper="{ placement: 'left', offsetDistance: 40 }">
          <template v-if="tooltipComponent" #text>
            <component :is="tooltipComponent.component" v-bind="tooltipComponent.props" />
          </template>
          <p>{{ getters.getName(item) }}</p>
        </UTooltip>

        <slot name="label" :item="item" />
      </div>

      <HorizontalFill />

      <!-- Management buttons; stop modifier prevents clicks from also toggling children -->
      <div class="invisible group-hover:visible flex gap-x-2">
        <slot name="buttons" :can-create-node="getters.canCreateNode(item as Node)" :can-create-leaf="getters.canCreateLeaf(item as Node)" :can-edit="canEdit" :item="item" />
      </div>
    </div>

    <!-- Padding creates a nested tree appearance -->
    <div v-if="!collapsed && hasChildren" class="flex pl-3 flex-grow">
      <div class="border-l border-l-neutral/30 mx-1 my-2" />
      <div class="flexcol flex-grow">
        <!-- Child nodes; events must be propagated to root -->
        <TreeItem v-for="child in childNodes" :item="child" v-on="onEvent">
          <template v-slot:label="{ item: child }">
            <slot name="label" :item="child" />
          </template>
          <template v-slot:buttons="{ item: child }">
            <slot name="buttons" :can-create-node="getters.canCreateNode(child as Node)" :can-create-leaf="getters.canCreateLeaf(child as Node)" :can-edit="canEditNode(child)" :item="child" />
          </template>
        </TreeItem>
        
        <!-- Leafs -->
        <TreeItem v-for="leaf in leafs" :item="leaf" v-on="onEvent">
          <template v-slot:label="{ item: child }">
            <slot name="label" :item="child" />
          </template>
          <template v-slot:buttons="{ item: child }">
            <slot name="buttons" :can-create-node="false" :can-create-leaf="false" :can-edit="canEditNode(child)" :item="child" />
          </template>
        </TreeItem>
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
  isSelected?: (node: Node | Leaf) => boolean,
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

const childNodes = computed(() => {
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

/** Returns whether a node can be edited. */
function canEditNode(node: Node | Leaf) {
  const nodeType = getters.getNodeType(node)
  return nodeType == 'leaf' ? getters.canEditLeaf(node as Leaf) : getters.canEditNode(node as Node)
}

/** Whether this item's node can be edited. */
const canEdit = computed(() => {
  return canEditNode(props.item as Node)
})

const hasChildren = computed(() => {
  return childNodes.value.length > 0 || leafs.value.length > 0
})

/** Applies hover classes when the element is marked as selected as well. */
const extraContainerClasses = computed(() => {
  const isSelected = getters.isSelected?.(props.item)
  return {
    'hover:bg-secondary/50': !isSelected,
    'bg-secondary/50': isSelected,
  }
})

</script>