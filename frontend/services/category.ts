/**
 * Utility methods for /categories/ API routes.
 */
import Service from './service'

class CategoryService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Creates a category. */
  async createCategory(request: CategoryCreationRequest): Promise<Category> {
    try {
      const response = await this.post('/categories/', request)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Fetches a category by its path; expects a leading slash. */
  async getCategory(path: string, published_only?: boolean, limit?: integer, skip?: integer): Promise<Category> {
    try {
      const response = await this.get('/categories' + path, {
        articles_amount: limit,
        articles_skip: skip,
        published_only: published_only,
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Updates a category's data. */
  async updateCategory(path: string, request: CategoryUpdateRequest): Promise<Category> {
    try {
      const response = await this.patch('/categories' + path, request) // Path is expected to have leading slash.
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default CategoryService