import { useQuery } from "@tanstack/vue-query"

/** Query for fetching all tags used on the site. */
export const useSiteTags = () => {
  const articleService = useArticleService()
  return useQuery({
    queryKey: ['allArticleTags'],
    queryFn: async () => {
      return await articleService.getAllTags()
    },
  })
}
