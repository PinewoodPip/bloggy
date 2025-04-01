/**
 * Utility methods for /search/ API routes.
 */
import Service from './service'

class SearchService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Searches articles by title, content & authors. */
  async searchArticles(text: string, limit: integer=5): Promise<ArticleSearchResults> {
    try {
      const response = await this.get('/search/articles', {
        text: text,
        limit: limit,
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default SearchService