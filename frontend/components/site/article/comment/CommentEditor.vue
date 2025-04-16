<!-- Template for a comment writing box. -->
<template>
  <div class="flexcol">
    <!-- Toolbar -->
    <EditorToolbar @action-use="onActionUsed" />

    <!-- Document -->
    <EditorDocument ref="document" :initial-content="''" />

    <!-- Button area -->
    <div class="flex flex-grow mt-1">
      <!-- Reply label -->
      <div v-if="parentComment" class="flex badge badge-md bg-secondary hover:bg-secondary/80 cursor-pointer py-3" @click="cancelReply">
        <UIcon class="text-secondary-content size-4 mr-2" name="material-symbols:cancel-outline-rounded" />
        <span class="text-secondary-content">Replying to {{ parentComment.author.display_name }}</span>
      </div>

      <HorizontalFill />
      
      <!-- Post button -->
      <MutationButton class="btn-primary" icon="material-symbols:add-comment" :status="postStatus" @click="postComment">Post {{ isReplying ? 'reply' : 'comment' }}</MutationButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import * as Toolbar from '~/src/editor/Toolbar'

const commentService = useCommentService()
const responseToast = useResponseToast()
const editorDocument = useTemplateRef('document')
const articlePath = useArticlePath()
const editor = ref(useCommentEditor())

const props = defineProps<{
  parentComment: ArticleComment | null,
}>();

const emit = defineEmits<{
  post: [ArticleComment],
  cancelReply: [],
}>();

function postComment() {
  const state = editorDocument.value?.editorState!
  const markdown = editor.value.serializeDocument(state)
  requestPost({
    content: markdown,
    parent_comment_id: props.parentComment ? props.parentComment.id : undefined,
  })
}

function cancelReply() {
  emit('cancelReply')
}

function onActionUsed(item: Toolbar.GroupItem | Toolbar.actionGroupItemIdentifier) {
  editorDocument.value?.onActionUsed(item)
}

const isReplying = computed(() => {
  return props.parentComment != null
})

// TODO extract?
const editorView = computed(() => {
  return editorDocument.value?.editorView
})
const editorState = computed(() => {
  return editorDocument.value?.editorState
})

// Expose editor state to all child components
// @ts-ignore
provide<Ref<Editor.Editor>>('editor', editor)
provide('editorView', editorView)
provide('editorState', editorState)

/** Mutation for uploading the comment. */
const { mutate: requestPost, status: postStatus } = useMutation({
  mutationFn: (request: CommentCreationRequest) => {
    return commentService.postArticleComment(articlePath.value!, request)
  },
  onSuccess: (comment) => {
    emit('post', comment)
    responseToast.showSuccess('Comment posted')
  },
  onError: (err) => {
    responseToast.showError('Failed to post comment', err)
  }
})

</script>