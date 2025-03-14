<!-- Component for displaying an article's metadata. -->
<template>
  <div class="group flex items-center hover:bg-secondary/50 rounded-btn cursor-pointer select-none p-1" @click="emit('click', article)">
    <div class="flex gap-x-2">
      <!-- Icon -->
      <Icon class="size-6" icon="article" />

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
        <IconButton class="btn-sm btn-secondary" icon="edit-outline" :override-height="true" @click.stop="emit('edit', article)" />
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
  click: [ArticlePreview],
}>()

const canEdit = computed(() => {
  return true // TODO permissions system
})

</script>