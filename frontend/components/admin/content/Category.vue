<!-- Component for displaying a category's metadata and its children recursively. -->
<template>
  <div class="flexcol select-none">
    <!-- Category; toggles children visibility on click -->
    <div class="flex items-center hover:bg-secondary/50 rounded-btn cursor-pointer p-1" @click="collapsed = !collapsed">
      <div class="flex gap-x-2">
        <!-- Folder icon indicates open/collapsed state -->
        <UIcon class="size-6" :name="collapsed ? 'i-material-symbols-folder' : 'i-material-symbols-folder-open'" />

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
      <div class="flex gap-x-2">
        <!-- Create child category button -->
        <IconButton class="btn-sm btn-secondary" icon="i-material-symbols-add-2" :override-height="true" @click.stop="emit('createChild', category.id)" />
        <!-- Edit button -->
        <IconButton v-if="canEdit" class="btn-sm btn-secondary" icon="i-material-symbols-edit-outline" :override-height="true" @click.stop="emit('edit', category.id)" />
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

// Uncollapse the root category by default
watchEffect(() => {
  if (props.category.path === '/') {
    collapsed.value = false
  }
})

</script>