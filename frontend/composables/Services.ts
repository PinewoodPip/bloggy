import UserService from "~/services/user"
import CategoryService from "~/services/category"
import ArticleService from "~/services/article"

// Cached service instances;
// each composable only ever creates one of each service.
var userService: UserService|null = null
var categoryService: CategoryService|null = null
var articleService: ArticleService|null = null

export const useUserService = () => {
  if (!userService) {
    const config = useRuntimeConfig()
    userService = new UserService(config.public.API_URL as string)
  }
  return userService
}

export const useCategoryService = () => {
  if (!categoryService) {
    const config = useRuntimeConfig()
    categoryService = new CategoryService(config.public.API_URL as string)
  }
  return categoryService
}

export const useArticleService = () => {
  if (!articleService) {
    const config = useRuntimeConfig()
    articleService = new ArticleService(config.public.API_URL as string)
  }
  return articleService
}
