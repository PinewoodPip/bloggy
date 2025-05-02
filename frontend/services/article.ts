/**
 * Utility methods for /articles/ API routes.
 */
import type { CategoryPreview } from './category'
import Service from './service'
import type { User } from './user'

export type articleID = integer
export type ArticleViewMode = "single_page"|"by_sections"

export type ArticlePreview = {
  id: integer,
  filename: string,
  title: string,
  creation_time: dateISOString,
  publish_time?: dateISOString,
  is_visible: boolean,
  category_path: string,
  category_id: integer,
  category_name: string,
  /** Full path to article */
  path: string,
  category_sorting_index: integer,
  authors: User[],
  summary: string,
  tags: string[],
  can_comment: boolean,
  comments_count: integer,
  featured_image_path: path,
}

export type Article = ArticlePreview & {
  category: CategoryPreview,
  /** Raw document text */
  content: string,
  view_type: ArticleViewMode,
  show_authors: boolean,
  last_edit_time: dateISOString,
  parent_category_names: string[],
  annotations: ArticleAnnotation[]
}

export type ArticleCreationRequest = {
  filename: string,
  title: string,
  /** Raw document text */
  content: string,
  summary: string,
  text: string,
}

export type ArticleAnnotationInput = {
  id: integer,
  author: string,
  comment: string,
  start: integer,
  end: integer,
}

export type ArticleAnnotation = {
  id: integer,
  author: User,
  comment: string,
  start: integer,
  end: integer,
}

export type ArticleUpdateRequest = {
  filename?: string,
  title?: string,
  /** Markdown document */
  content?: string,
  publish_time?: dateISOString,
  is_visible?: boolean,
  view_type?: "single_page"|"by_sections",
  can_comment?: boolean,
  show_authors?: boolean,
  category_sorting_index?: integer,
  authors?: string[],
  category_path?: string,
  summary?: string,
  /** Plaintext transcript of the article */
  text?: string,
  tags?: string[],
  is_draft?: boolean,
  featured_image_path?: path,
  annotations?: ArticleAnnotationInput[],
}

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
    const response = await this.post('/articles' + path, request)
    return response.data
  }

  /** Fetches an article by its path; expects a leading slash. */
  async getArticle(path: path, draft?: boolean): Promise<Article> {
    const response = await this.get('/articles' + path, {
      draft: draft,
    })
    return response.data
  }

  /** Updates an article's data. */
  async updateArticle(path: path, request: ArticleUpdateRequest): Promise<Article> {
    const response = await this.patch('/articles' + path, request)
    return response.data
  }

  /** Fetches all tags that have been used on the site. */
  async getAllTags(): Promise<Tags> {
    return (await this.get('/articles/tags')).data
  }
}

export default ArticleService