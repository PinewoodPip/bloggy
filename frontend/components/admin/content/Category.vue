<!-- Component for displaying a category's metadata and its children recursively. -->
<template>
  <div class="flexcol select-none">
    <!-- Category; toggles children visibility on click -->
    <div class="group flex items-center hover:bg-secondary/50 rounded-btn cursor-pointer p-1" @click="collapsed = !collapsed">
      <div class="flex gap-x-2">
        <!-- Folder icon indicates open/collapsed state. Empty categories always show as open -->
        <UIcon class="size-6" :name="(collapsed && categoryIsEmpty) ? 'i-material-symbols-folder' : 'i-material-symbols-folder-open'" />

        <!-- Path and title -->
        <UTooltip :text="category.path">
          <p>{{ category.name !== '/' ? category.name : 'Root' }}</p>
        </UTooltip>

        <!-- TODO show editor icons -->
        <div class="avatar-group -space-x-2">
          <AvatarIcon class="size-6" />
          <AvatarIcon class="size-6" />
          <AvatarIcon class="size-6" />
        </div>
      </div>

      <HorizontalFill />

      <!-- Management buttons; stop modifier prevents clicks from also toggling children -->
      <div class="invisible group-hover:visible flex gap-x-2">
        <!-- Create child category button -->
        <UTooltip text="Create category">
          <IconButton class="btn-sm btn-secondary" icon="i-material-symbols-add-2" :override-height="true" @click.stop="emit('createChild', category.id)" />
        </UTooltip>
        <!-- Edit button -->
        <UTooltip v-if="canEdit" text="Edit category">
          <IconButton class="btn-sm btn-secondary" icon="i-material-symbols-edit-outline" tooltip="Edit category" :override-height="true" @click.stop="emit('edit', category.id)" />
        </UTooltip>
      </div>
    </div>

    <!-- Subcategories -->
    <!-- Padding creates a nested tree appearance -->
    <div v-if="!collapsed" class="pl-2">
      <Category v-for="subcategory in category.subcategories" :category="subcategory" @create-child="e => {emit('createChild', e)}" @edit="e => {emit('edit', e)}" />
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  category: Category,
}>()

const emit = defineEmits<{
  createChild: [categoryID],
  edit: [categoryID],
}>()

const collapsed = ref(true)

const canEdit = computed(() => {
  return props.category.path !== '/' // Cannot edit root
})

/** Whether the category has no subcategories nor articles. */
const categoryIsEmpty = computed(() => {
  return props.category.subcategories.length != 0 || props.category.articles.length != 0
})

// Uncollapse the root category by default
watchEffect(() => {
  if (props.category.path === '/') {
    collapsed.value = false
  }
})

</script>