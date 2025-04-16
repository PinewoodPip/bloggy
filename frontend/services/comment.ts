/**
 * Utility methods for /comments/ API routes.
 */
import Service from './service'

export type CommentCreationRequest = {
  parent_comment_id?: integer,
  content: string,
}

export type CommentUpdateRequest = {
  content: string,
}

export type ArticleComment = {
  id: integer,
  author: User,
  post_time: dateISOString,
  content: string,
  replies: ArticleComment[],
}

/** Lists top-level comments of an article. */
export type ArticleComments = {
  comments: ArticleComment[],
}

class CommentService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Fetches the comments of an article. */
  async getArticleComments(articlePath: path): Promise<ArticleComments> {
    const response = await this.get('/comments' + articlePath)
    return response.data
  }
  
  /** Posts a comment on an article. */
  async postArticleComment(articlePath: path, comment: CommentCreationRequest): Promise<ArticleComment> {
    const response = await this.post('/comments' + articlePath, comment)
    return response.data
  }

  /** Deletes a comment and all its replies. */
  async deleteArticleComment(articlePath: path, commentID: integer) {
    const response = await this.delete(`/comments${articlePath}/${commentID}`)
    return response.data
  }
}

export default CommentService