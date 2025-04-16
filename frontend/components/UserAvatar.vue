<!-- Displays a user's avatar. -->
<template>
  <AvatarIcon :src="imageURL" />
</template>

<script setup lang="ts">

const props = defineProps<{
  user: User,
}>();

const imageURL = computed(() => {
  return props.user.avatar_file_path ? CMSUtils.resolveFilePath(props.user.avatar_file_path) : undefined
})

</script>