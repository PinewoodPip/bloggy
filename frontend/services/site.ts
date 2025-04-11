/**
 * Utility methods for /site/ API routes.
 */
import Service from './service'

/**
 * Navigation output schemas
 */

export type NavigationNodeType = 'category' | 'article' | 'group' | 'external_url'

export type NavigationCategory = {
  type: 'category',
  category: CategoryPreview,
}
export type NavigationArticle = {
  type: 'article',
  article: ArticlePreview,
}
export type NavigationNodeGroup = {
  type: 'group',
  children: NavigationNode[],
  name: string,
}
export type NavigationExternalLink = {
  type: 'external_url',
  url: string,
  title: string,
}

export type Navigation = {
  root_nodes: NavigationNode[]
}

export type NavigationNode = NavigationCategory | NavigationArticle | NavigationNodeGroup | NavigationExternalLink

/**
 * Navigation input schemas
 */

export type NavigationNodeInput = NavigationCategoryInput | NavigationArticleInput | NavigationNodeGroupInput | NavigationExternalLink

export type NavigationCategoryInput = {
  type: 'category',
  category_path: string,
}
export type NavigationArticleInput = {
  type: 'article',
  category_path: string,
  article_filename: string,
}
export type NavigationNodeGroupInput = {
  type: 'group',
  children: NavigationNodeInput[],
  name: string,
}

export type NavigationUpdate = {
  root_nodes: NavigationNodeInput[],
}

/**
 * General config schemas
 */

export type SocialNetworkOutput = {
  id: string,
  name: string,
  can_share: boolean,
}

export type SiteConfigUpdate = {
  site_name?: string,
  theme?: string,
  favicon_path?: string,
  logo_path?: string,
  sidebar_document_path?: string,
  navigation?: NavigationUpdate,
  social_networks?: string[],
}

export type SiteConfig = {
  site_name: string,
  theme: string,
  favicon?: SiteFile,
  logo?: SiteFile,
  sidebar_document_path?: string,
  navigation: Navigation,
  social_networks: {[id: string]: SocialNetworkOutput},
}

class SiteService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Fetches the site's global config. */
  async getSiteConfig(): Promise<SiteConfig> {
    try {
      const response = await this.get('/site/config')
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Updates the site's global config. */
  async updateSiteConfig(config: SiteConfigUpdate): Promise<SiteConfig> {
    try {
      const response = await this.patch('/site/config', config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Fetches the site's sidebar document. */
  async getSidebar(): Promise<Article> {
    return (await this.get('/site/sidebar')).data
  }
}

export default SiteService