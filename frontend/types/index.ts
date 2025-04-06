
export { }

declare global {
  type integer = number
  type userRole = "admin"|"editor"
  /** ISO 8601 date */
  type dateISOString = string
  type base64String = string
  /** Slash-delimited resource path, with a leading slash. */
  type path = string

  type DynamicComponentDef = {
    component: Component | string,
    props: object,
  }

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
    creation_time: dateISOString,
    publish_time?: dateISOString,
    is_visible: boolean,
    category_path: string,
    category_name: string,
    /** Full path to article */
    path: string,
    category_sorting_index: integer,
    authors: User[],
    summary: string,
    tags: string[],
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
    summary: string,
    text: string,
  }

  type ArticleUpdateRequest = {
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
  }

  type ArticleSearchResults = {
    results: ArticlePreview[],
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

  /** File schemas */
  type SiteFileData = {
    path: string,
    filename: string,
    content: base64String,
  }

  type SiteFileCreationRequest = {
    path: string,
    content: base64String,
  }

  type SiteFilePreview = SiteFileData & {
    uploader: User,
  }

  type SiteFile = SiteFilePreview & {
    content: base64String,
  }

  type SiteFileTree = {
    folder_name: string,
    path: string,
    files: SiteFilePreview[],
    subfolders: {[key: string]: SiteFileTree}
  }

  type SiteFileUpdate = SiteFileData & {
    path?: string,
    content?: base64String,
  }
}
