
/** Creates a computed for an article path extracted from the current route. */
export const useArticlePath = () => {
  const route = useRoute()
  const params = route.params.article_path as string[]
  const path = computed(() => {
    return params ? '/' + params.join('/') : null
  })
  return path
}