<!-- Component for displaying an article's metadata. -->
<template>
  <div class="group flex items-center hover:bg-secondary/50 rounded-btn cursor-pointer select-none p-1" @click="collapsed = !collapsed">
    <div class="flex gap-x-2">
      <!-- Icon -->
      <UIcon class="size-6" name="i-material-symbols-article" />

      <!-- Path and title -->
      <UTooltip :text="article.path">
        <p>{{ article.title }}</p>
      </UTooltip>

      <!-- TODO show editor icons -->
      <div class="avatar-group -space-x-2">
        <AvatarIcon class="size-6" />
        <AvatarIcon class="size-6" />
        <AvatarIcon class="size-6" />
      </div>
    </div>

    <HorizontalFill />

    <!-- Management buttons -->
    <div class="invisible group-hover:visible flex gap-x-2">
      <!-- Edit button -->
      <UTooltip v-if="canEdit" text="Edit article">
        <IconButton class="btn-sm btn-secondary" icon="i-material-symbols-edit-outline" :override-height="true" @click="emit('edit', article)" />
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  article: ArticlePreview,
}>()

const emit = defineEmits<{
  edit: [ArticlePreview],
}>()

const collapsed = ref(true)

const canEdit = computed(() => {
  return true // TODO permissions system
})

</script>