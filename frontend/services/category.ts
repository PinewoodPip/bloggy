/**
 * Utility methods for /categories/ API routes.
 */
import type { ArticlePreview } from './article'
import Service from './service'

export type categoryID = integer
export type categorySortingMode = "chronological"|"manual"
export type categoryViewMode = "vertical"|"grid"

export type CategoryPreview = {
  id: categoryID,
  name: string,
  description: string,
  directory_name: string,
  path: path,
  view_type: categoryViewMode,
  sorting_type: categorySortingMode,
}

export type Category = CategoryPreview & {
  path: string,
  articles: ArticlePreview[],
  /** Total amount of articles regardless of pagination limits applied to the articles field. */
  total_articles: integer,
  subcategories: Category[],
}

export type CategoryCreationRequest = {
  name: string,
  description: string,
  directory_name: string,
  parent_category_path: string,
}


export type CategoryUpdateRequest = {
  name?: string,
  description?: string,
  directory_name?: string,
  view_type?: categoryViewMode,
  sorting_type?: categorySortingMode,
  parent_category_path?: string,
}

class CategoryService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Creates a category. */
  async createCategory(request: CategoryCreationRequest): Promise<Category> {
    const response = await this.post('/categories/', request)
    return response.data
  }

  /** Fetches a category by its path; expects a leading slash. */
  async getCategory(path: string, published_only?: boolean, limit?: integer, skip?: integer): Promise<Category> {
    const response = await this.get('/categories' + path, {
      articles_amount: limit,
      articles_skip: skip,
      published_only: published_only,
    })
    return response.data
  }

  /** Updates a category's data. */
  async updateCategory(path: string, request: CategoryUpdateRequest): Promise<Category> {
    const response = await this.patch('/categories' + path, request) // Path is expected to have leading slash.
    return response.data
  }
}

export default CategoryService