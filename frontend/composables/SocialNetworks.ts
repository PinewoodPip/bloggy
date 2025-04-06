/**
 * Composables for getting the social networks the site supports.
 */
import { useQuery } from '@tanstack/vue-query'
import type { SocialNetworkOutput } from '~/services/site'
import { useSiteConfig } from './SiteConfig'

export const NETWORK_ICONS: {[id: string]: string} = {
  facebook: "i-la-facebook",
  x: "i-la-twitter",
  tumblr: "i-la-tumblr",
  reddit: "i-la-reddit",
  pinterest: "i-la-pinterest",
  vk: "i-la-vk",
  weibo: "i-la-weibo",
  wordpress: "i-la-wordpress",
  baidu: "i-la-baidu",
  linkedin: "i-la-linkedin",
}

export type SocialNetworkOutputWithIcon = SocialNetworkOutput & {
  icon: string,
}

/** Query for the social networks the site supports. */
export const useSocialNetworks = () => {
  const { data: config } = useSiteConfig()
  const query = useQuery({
    queryKey: ["socialNetworks"],
    queryFn: async () => {
      // Add icon field
      const networks: {[id: string]: SocialNetworkOutputWithIcon} = {}
      for (const id in config.value?.social_networks) {
        const network = config.value.social_networks[id]
        networks[id] = {
          icon: NETWORK_ICONS[id] || 'material-symbols:question-mark',
          ...network,
        }
      }
      return networks
    },
  })

  /** Networks that the site admits sharing to. */
  const enabledNetworks = computed(() => {
    const networks: {[id: string]: SocialNetworkOutputWithIcon} = {}
    for (const id in config.value?.social_networks) {
      const network = config.value.social_networks[id]
      if (network.can_share) {
        networks[id] = Object.assign({}, network) as SocialNetworkOutputWithIcon
        networks[id].icon = NETWORK_ICONS[id] || 'material-symbols:question-mark'  // Add icon field
      }
    }
    return networks
  })

  const networks = query.data

  return { query, networks, enabledNetworks } 
}