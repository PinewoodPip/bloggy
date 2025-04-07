import UserService from "~/services/user"
import CategoryService from "~/services/category"
import ArticleService from "~/services/article"
import FileService from "~/services/file"
import SearchService from "~/services/search"
import SiteService from "~/services/site"
import type Service from "~/services/service"

// Cached service instances;
// each composable only ever creates one of each service.
var serviceInstances: {[className: string]: Service} = {}

/** Pooled service composable. */
export const useService = (id: string, serviceClass: new (apiURL: string) => Service) => {
  if (!(id in serviceInstances)) {
    const config = useRuntimeConfig()
    const instance = new serviceClass(import.meta.server ? config.public.serverApiUrl : config.public.apiUrl)
    serviceInstances[id] = instance
  }
  return serviceInstances[id]
}

export const useUserService = () => {
  return useService("User", UserService) as UserService
}
export const useCategoryService = () => {
  return useService("Category", CategoryService) as CategoryService
}
export const useArticleService = () => {
  return useService("Article", ArticleService) as ArticleService
}
export const useFileService = () => {
  return useService("File", FileService) as FileService
}
export const useSearchService = () => {
  return useService("Search", SearchService) as SearchService
}
export const useSiteService = () => {
  return useService("Site", SiteService) as SiteService
}
