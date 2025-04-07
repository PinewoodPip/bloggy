/**
 * Utility methods for /articles/ API routes.
 */
import Service from './service'

export type Tag = {
  id: integer,
  name: string
}

export type Tags = {
  tags: Tag[]
}

class ArticleService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Creates an article. */
  async createArticle(path: path, request: ArticleCreationRequest): Promise<Article> {
    try {
      const response = await this.post('/articles' + path, request)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Fetches an article by its path; expects a leading slash. */
  async getArticle(path: path): Promise<Article> {
    try {
      const response = await this.get('/articles' + path)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Updates an article's data. */
  async updateArticle(path: path, request: ArticleUpdateRequest): Promise<Article> {
    try {
      const response = await this.patch('/articles' + path, request)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Fetches all tags that have been used on the site. */
  async getAllTags(): Promise<Tags> {
    return (await this.get('/articles/tags')).data
  }
}

export default ArticleService