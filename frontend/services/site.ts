/**
 * Utility methods for /site/ API routes.
 */
import Service from './service'
/**
 * General config schemas
 */

export type SocialNetworkOutput = {
  id: string,
  name: string,
  can_share: boolean,
}

export type SiteConfig = {
  site_name: string,
  favicon_path?: string,
  logo_path?: string,
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

}

export default SiteService