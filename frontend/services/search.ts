/**
 * Utility methods for /search/ API routes.
 */
import Service from './service'

type SearchQuery = {
  text?: string,
  tags?: string[],
  /** Expected to be editor display name. */
  authors?: string[],
  /** Max amount of articles to return. */
  limit?: integer,
}

class SearchService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Searches articles by title, content & authors. */
  async searchArticles(query: SearchQuery): Promise<ArticleSearchResults> {
    try {
      const response = await this.get('/search/articles', query)
      return response.data
    } catch (error) {
      throw error
    }
  }
  
  /** Fetches the latest published articles on the site. */
  async getLatestArticles(limit: integer, skip: integer): Promise<ArticleLatestPosts> {
    const response = await this.get('/search/articles/latest', {
      limit: limit,
      skip: skip,
    })
    return response.data
  }
}

export default SearchService