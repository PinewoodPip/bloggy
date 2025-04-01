<template>
  <div class="flexcol select-none">
    <!-- The item itself; toggles children visibility on click -->
    <div class="group flex items-center hover:bg-secondary/50 rounded-btn cursor-pointer p-1" @click="onClick">
      <div class="flex gap-x-2">
        <!-- Folder icon indicates open/collapsed state. Leaf items always show as open -->
        <UIcon class="size-6" :name="icon" />

        <!-- Path and title -->
        <UTooltip :text="tooltipGetter(item)">
          <template v-if="tooltipComponent" #text>
            <component :is="tooltipComponent.component" v-bind="tooltipComponent.props" />
          </template>
          <p>{{ nameGetter(item) }}</p>
        </UTooltip>

        <!-- TODO slot for extra icons -->
      </div>

      <HorizontalFill />

      <!-- Management buttons; stop modifier prevents clicks from also toggling children -->
      <div class="invisible group-hover:visible flex gap-x-2">
        <!-- Create node button -->
        <UTooltip v-if="canCreateNode(item as Node)" text="Create folder">
          <IconButton class="btn-sm btn-secondary" icon="material-symbols:create-new-folder" :override-height="true" @click.stop="emit('createNode', item as Node)" />
        </UTooltip>
        <!-- Create leaf button -->
        <UTooltip v-if="canCreateLeaf(item as Node)" text="Create item">
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
        <TreeItem v-for="child in children" :item="child" :node-type-getter="nodeTypeGetter" :children-node-getter="childrenNodeGetter" :children-leaf-getter="childrenLeafGetter" :name-getter="nameGetter" :tooltip-getter="tooltipGetter" :can-create-leaf="canCreateLeaf" :can-create-node="canCreateNode" :leaf-icon="leafIcon" :can-edit-node="canEditNode" :can-edit-leaf="canEditLeaf" :can-delete-node="canDeleteNode" :can-delete-leaf="canDeleteLeaf" :tooltip-component-getter="props.tooltipComponentGetter" v-on="onEvent" />
        
        <!-- Leafs -->
        <TreeItem v-for="child in leafs" :item="child" :node-type-getter="nodeTypeGetter" :children-node-getter="childrenNodeGetter" :children-leaf-getter="childrenLeafGetter" :name-getter="nameGetter" :tooltip-getter="tooltipGetter" :can-create-leaf="canCreateLeaf" :can-create-node="canCreateNode" :leaf-icon="leafIcon" :can-edit-node="canEditNode" :can-edit-leaf="canEditLeaf" :can-delete-node="canDeleteNode" :can-delete-leaf="canDeleteLeaf" :tooltip-component-getter="props.tooltipComponentGetter" v-on="onEvent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="Node extends object, Leaf extends Object">

const props = defineProps<{
  item: Node | Leaf,
  nodeTypeGetter: (obj: Node | Leaf) => "node" | "leaf",
  childrenNodeGetter: (obj: Node) => Node[],
  childrenLeafGetter: (obj: Node) => Leaf[],
  nameGetter: (obj: Node | Leaf) => string,
  tooltipGetter: (obj: Node | Leaf) => string,
  canCreateLeaf: (obj: Node) => boolean,
  canCreateNode: (obj: Node) => boolean,
  canEditNode: (node: Node) => boolean,
  canEditLeaf: (leaf: Leaf) => boolean,
  canDeleteNode: (node: Node) => boolean,
  canDeleteLeaf: (leaf: Leaf) => boolean,
  /** Allows customizing the tooltip element by the name of the item. */
  tooltipComponentGetter?: (node: Node | Leaf) => DynamicComponentDef | null,
  leafIcon: string,
}>()

const emit = defineEmits<{
  createLeaf: [Node],
  createNode: [Node],
  edit: [Node | Leaf],
  click: [Node | Leaf],
}>()

const children = computed(() => {
  return props.childrenNodeGetter(props.item as Node)
})

function onClick() {
  if (hasChildren.value) {
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
  return props.tooltipComponentGetter ? props.tooltipComponentGetter(props.item) : null
})

const icon = computed(() => {
  if (hasChildren.value) {
    return collapsed.value ? 'material-symbols:folder' : 'material-symbols:folder-open'
  } else {
    return props.leafIcon
  }
})

const leafs = computed(() => {
  return nodeType.value == 'node' ? props.childrenLeafGetter(props.item as Node) : []
})

const collapsed = ref(false)

const nodeType = computed(() => {
  return props.nodeTypeGetter(props.item)
})

const canEdit = computed(() => {
  return nodeType.value == 'leaf' ? props.canEditLeaf(props.item as Leaf) : props.canEditNode(props.item as Node)
})

const hasChildren = computed(() => {
  return children.value.length > 0 || leafs.value.length > 0
})

</script>

<style lang="css" scoped>
.test {
  box-shadow: -2px 0 #000;
}
</style>