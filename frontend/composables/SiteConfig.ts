import { useQuery } from "@tanstack/vue-query"

/** Query for global site configuration. */
export const useSiteConfig = () => {
  const SiteService = useSiteService()
  return useQuery({
    queryKey: ["siteConfig"],
    queryFn: async () => {
      return await SiteService.getSiteConfig()
    },
    staleTime: 60 * 60 * 1000, // 1 hour cache
  })
}

/** Creates a computed for the site's metadata. */
export const useSiteMeta = () => {
  const siteConfig = useSiteConfig()
  return computed(() => {
    const siteName = siteConfig.data.value ? siteConfig.data.value.site_name : ''
    return {
      siteName: siteName,
      titleSuffix: ` - ${siteName}`
    }
  })
}
