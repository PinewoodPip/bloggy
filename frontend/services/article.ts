/**
 * Utility methods for /articles/ API routes.
 */
import Service from './service'

class ArticleService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Creates an article. */
  async createArticle(path: string, request: ArticleCreationRequest): Promise<Article> {
    try {
      const response = await this.post('/articles' + path, request) // Path is expected to have leading slash.
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Fetches an article by its path; expects a leading slash. */
  async getArticle(path: string): Promise<Article> {
    try {
      const response = await this.get('/articles' + path) // Path is expected to have leading slash.
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Updates an article's data. */
  async updateArticle(path: string, request: ArticleUpdateRequest): Promise<Article> {
    try {
      const response = await this.patch('/articles' + path, request) // Path is expected to have leading slash.
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default ArticleService