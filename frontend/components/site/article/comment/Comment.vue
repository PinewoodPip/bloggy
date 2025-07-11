<template>
  <div class="flex flex-grow gap-x-3">
    <!-- Avatar -->
    <div>
      <UserAvatar class="size-10" :user="comment.author" />
    </div>

    <!-- Comment -->
    <div class="flexcol flex-grow">
      <!-- Header -->
      <div class="flex gap-x-3">
        <span class="font-bold">{{ authorNameLabel }}</span>
        <span class="text-base-content/70">Posted on {{ commentDate }}</span>
      </div>

      <!-- Content -->
      <div>
        <SiteArticleContent :schema="CommentEditorSchema" :initial-content="comment.content" />
      </div>

      <!-- Reply button -->
      <div class="flex gap-x-2 flex-grow">
        <IconButton v-if="canReply" class="btn-ghost btn-sm" icon="material-symbols:reply" @click="onReplyRequested">Reply</IconButton>
        <MutationButton v-if="canDelete" class="hover:!btn-error [&:not(:hover)]:btn-ghost btn-sm" :status="deletionStatus" icon="material-symbols:delete-outline" @click="deleteComment">Delete</MutationButton>
      </div>

      <!-- Replies -->
      <div v-if="comment.replies.length > 0" class="collapse collapse-arrow border border-base-300/50">
        <input type="checkbox" /> <!-- For collapsable -->
        <div class="collapse-title font-semibold">{{ repliesLabel }}</div>
        <div class="collapse-content">
          <!-- Will propagate events -->
          <SiteArticleComment v-for="reply in comment.replies" :key="comment.id" :comment="reply" @delete="(ev) => emit('delete', ev)" @reply="(ev) => emit('reply', ev)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query';
import { schema as CommentEditorSchema } from '~/src/editor/schemas/Comment'

const user = useLoggedInUser()
const articlePath = useArticlePath()
const responseToast = useResponseToast()
const commentService = useCommentService()

const emit = defineEmits<{
  delete: [ArticleComment],
  reply: [ArticleComment],
}>();

const props = defineProps<{
  comment: ArticleComment,
}>();

function onReplyRequested() {
  emit('reply', props.comment)
}

function deleteComment() {
  deletePost(props.comment.id)
}

const canDelete = computed(() => {
  return user.data.value && (isOwnComment.value || user.data.value.role !== 'reader')
})

const isOwnComment = computed(() => {
  return user.data.value && user.data.value.id == props.comment.author.id
})

const canReply = computed(() => {
  return user.data.value
})

const commentDate = computed(() => {
  const date = props.comment.post_time
  if (date) {
    return new Date(date).toDateString() // TODO prettify
  } else {
    return null
  }
})

const repliesLabel = computed(() => {
  const amount = props.comment.replies.length
  return `${amount} ${amount !== 1 ? 'replies' : 'reply'}`
})

const authorNameLabel = computed(() => {
  return isOwnComment.value ? 'You' : props.comment.author.display_name
})

/** Mutation for deleting a comment. */
const { mutate: deletePost, status: deletionStatus } = useMutation({
  mutationFn: (commentID: integer) => {
    return commentService.deleteArticleComment(articlePath.value!, commentID)
  },
  onSuccess: (_) => {
    emit('delete', props.comment)
    responseToast.showSuccess('Comment deleted')
  },
  onError: (err) => {
    responseToast.showError('Failed to delete comment', err)
  }
})

</script>