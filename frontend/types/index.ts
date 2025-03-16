
export { }

declare global {
  type integer = number
  type userRole = "admin"|"editor"

  /** Schema for GET /users/{username} */
  type User = {
    username: string,
    role: userRole,

    // Following fields only present for editor accounts
    display_name?: string, 
    contact_email?: string,
    biography?: string,
  }

  /** Schema for POST /users/ */
  type UserCreationRequest = {
    username: string,
    password: string,
    display_name: string,
    biography?: string,
    contact_email?: string,
  }

    /** Schema for PATCH /users/ */
  type UserUpdateRequest = {
    username?: string,
    password?: string,
    display_name?: string,
    biography?: string,
    contact_email?: string|null,
  }

  type CategoryPreview = {
    id: categoryID,
    name: string,
    description: string,
    directory_name: string,
    view_type: categoryViewMode,
    sorting_type: categorySortingMode,
  }

  type ArticleViewMode = "single_page"|"by_sections"

  type articleID = integer

  type ArticlePreview = {
    id: integer,
    filename: string,
    title: string,
    creation_time: Date, // TODO
    publish_time?: Date, // TODO
    is_visible: boolean,
    category_path: string,
    /** Full path to article */
    path: string,
    category_sorting_index: integer,
    authors: User[],
  }

  type Article = ArticlePreview & {
    category: CategoryPreview,
    /** Raw document text */
    content: string,
    view_type: ArticleViewMode,
    can_comment: boolean,
    show_authors: boolean,
  }

  type categoryID = integer
  type categorySortingMode = "chronological"|"manual"
  type categoryViewMode = "vertical"|"grid"

  type Category = CategoryPreview & {
    path: string,
    articles: ArticlePreview[],
    /** Total amount of articles regardless of pagination limits applied to the articles field. */
    total_articles: integer,
    subcategories: Category[],
  }

  type CategoryCreationRequest = {
    name: string,
    description: string,
    directory_name: string,
    parent_category_path: string,
  }

  type ArticleCreationRequest = {
    filename: string,
    title: string,
    /** Raw document text */
    content: string,
  }

  type ArticleUpdateRequest = {
    filename?: string,
    title?: string,
    /** Raw document text */
    content?: string,
    publish_time?: integer, // TODO type
    is_visible?: boolean,
    view_type?: "single_page"|"by_sections",
    can_comment?: boolean,
    show_authors?: boolean,
    category_sorting_index?: integer,
    authors?: string[],
    category_path?: string,
  }

  type CategoryUpdateRequest = {
    name?: string,
    description?: string,
    directory_name?: string,
    view_type?: categoryViewMode,
    sorting_type?: categorySortingMode,
    parent_category_path?: string,
  }

  interface ContentPanelRelevantSearchItems {
    CategoryIDs: Set<categoryID>,
    ArticleIDs: Set<articleID>,
  }
}
