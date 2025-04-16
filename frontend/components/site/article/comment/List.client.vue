<!-- Container for comments of an article. -->
<template>
  <div v-if="commentsStatus === 'success'" class="large-content-block" ref="commentsTop">
    <h2>{{ commentsCount }} comments</h2>

    <SiteArticleCommentEditor v-if="canComment" ref="postBox" :parent-comment="replyComment" @post="onCommentPosted" @cancel-reply="onReplyCancelled" />
    <p v-else> <!-- TODO link -->
      Log-in to post comments.
    </p>

    <!-- Comments -->
    <div class="flexcol">
      <SiteArticleComment v-for="comment in articleComments?.comments" :comment="comment" :key="comment.id" @delete="onCommentDeleted" @reply="onReplyRequested" />
    </div>
  </div>
  <LoadingSpinner v-else />
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

const commentService = useCommentService()
const user = useLoggedInUser()
const responseToast = useResponseToast()
const router = useRouter()
const route = useRoute()

const commentsTop = useTemplateRef('commentsTop')

/** The comment being replied to, if any. */
const replyComment: Ref<ArticleComment | null> = ref(null)

/** All comment on the article, including replies. */
const allComments = computed(() => {
  const comments = []
  if (articleComments.value) {
    for (const comment of articleComments.value.comments) {
      comments.push(comment)
      addReplies(comments, comment)
    }
  }
  return comments
})

/** Total amount of comments, including replies. */
const commentsCount = computed(() => {
  return allComments.value.length
})

/** Whether the user can post comments. */
const canComment = computed(() => {
  return user.data.value && user.data.value.role !== 'admin' // Admins cannot post comments
})

function onReplyCancelled() {
  replyComment.value = null
}

/** Tracks the comment being replied to. */
function onReplyRequested(comment: ArticleComment) {
  replyComment.value = comment
  DOMUtils.scrollViewToElement(commentsTop)
}

/** Refetches comments when a new one is posted. */
function onCommentPosted(comment: ArticleComment) {
  refetchComments()
}
/** Refetches comments when one is deleted. */
function onCommentDeleted(comment: ArticleComment) {
  refetchComments()
}

/** Recursively copies replies of a comment into an array. */
function addReplies(arr: ArticleComment[], comment: ArticleComment) {
  for (const reply of comment.replies) {
    arr.push(reply)
    addReplies(arr, reply)
  }
}

/** Query for fetching comments */
const { data: articleComments, status: commentsStatus, refetch: refetchComments } = useQuery({
  queryKey: ['article', route.params.article_path, 'comments'],
  queryFn: async () => {
    const articlePath = '/' + (route.params.article_path as string[]).join("/")
    return await commentService.getArticleComments(articlePath)
  },
  retry: (count, err) => {
    if ((err as AxiosError).status === 404) {
      // Redirect back to home if the article URL is invalid
      responseToast.showError('Article not found')
      router.push('/') 
    } else if (count == 1) { // Show error on first failed fetch
      responseToast.showError('Failed to load article comments', err)
    }
    return true
  }
})

</script>