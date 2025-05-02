<!-- Template for a comment writing box. -->
<template>
  <div class="flexcol">
    <SimpleEditor ref="editorRef">
      <template #document>
        <div class="relative" @click="editorFocused = true" @focusin="editorFocused = true" @focusout="editorFocused = false">
          <p v-if="!editorFocused && isCommentEmpty" class="absolute text-base-content/70 left-2 top-2 select-none">Write a comment...</p>
          <EditorDocument key="editorDocument" ref="documentRef" :initial-content="''" />
        </div>
      </template>
    </SimpleEditor>

    <!-- Button area -->
    <div class="flex flex-grow mt-1">
      <!-- Reply label -->
      <div v-if="parentComment" class="flex badge badge-md bg-secondary hover:bg-secondary/80 cursor-pointer py-3" @click="cancelReply">
        <UIcon class="text-secondary-content size-4 mr-2" name="material-symbols:cancel-outline-rounded" />
        <span class="text-secondary-content">Replying to {{ parentComment.author.display_name }}</span>
      </div>

      <HorizontalFill />
      
      <!-- Post button -->
      <MutationButton v-if="editorFocused || !isCommentEmpty"  class="btn-primary" icon="material-symbols:add-comment" :status="postStatus" :disabled="!canPost" @click="postComment">Post {{ isReplying ? 'reply' : 'comment' }}</MutationButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import * as Tools from '~/src/editor/ToolManager'

const commentService = useCommentService()
const responseToast = useResponseToast()
const editorRef = useTemplateRef('editorRef')
const articlePath = useArticlePath()
const document = useTemplateRef('documentRef')
const editor = ref(useCommentEditor(() => document.value!.editorView))
useEditorProvides(editor, document)

const props = defineProps<{
  parentComment: ArticleComment | null,
}>();

const emit = defineEmits<{
  post: [ArticleComment],
  cancelReply: [],
}>();

const editorFocused = ref(false)

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

function onActionUsed(item: Tools.Tool | Tools.toolIdentifier) {
  editorDocument.value?.onActionUsed(item)
}

const isReplying = computed(() => {
  return props.parentComment != null
})

/** Whether the content can be posted. */
const canPost = computed(() => {
  return !isCommentEmpty.value // Cannot be empty
})

/** Whether the comment typed is an empty document. */
const isCommentEmpty = computed(() => {
  const state = editorDocument.value?.editorState!
  if (state && state.doc) {
    const text = state.doc.textContent as string
    return text.length == 0
  } else {
    return true
  }
})

const editorDocument = computed(() => {
  return document.value
})

/** Mutation for uploading the comment. */
const { mutate: requestPost, status: postStatus } = useMutation({
  mutationFn: (request: CommentCreationRequest) => {
    return commentService.postArticleComment(articlePath.value!, request)
  },
  onSuccess: (comment) => {
    emit('post', comment)
    responseToast.showSuccess('Comment posted')

    // Clear the editor
    const view = editorDocument.value?.editorView
    view?.dispatch(ProseMirrorUtils.deleteDocument(view.state))
  },
  onError: (err) => {
    responseToast.showError('Failed to post comment', err)
  }
})

</script>