import Article from "~/components/site/navigation/node/Article.vue"
import Category from "~/components/site/navigation/node/Category.vue"
import ExternalLink from "~/components/site/navigation/node/ExternalLink.vue"
import Group from "~/components/site/navigation/node/Group.vue"
import type { NavigationNode } from "~/services/site"

/** Composable for the site's navigation bar schema. */
export const useNavigationBar = () => {
  const siteConfig = useSiteConfig()
  return computed(() => {
    return siteConfig.data.value ? siteConfig.data.value.navigation : {root_nodes: []}
  })
}

export const useNavigationNodeComponents = () => {
  return (node: NavigationNode): DynamicComponentDef => {
    switch (node.type) {
      case 'article': {
        return {
          component: Article,
          props: {
            node: node,
          }
        }
      }
      case 'category': {
        return {
          component: Category,
          props: {
            node: node,
          }
        }
      }
      case 'external_url': {
        return {
          component: ExternalLink,
          props: {
            node: node,
          }
        }
      }
      case 'group': {
        return {
          component: Group,
          props: {
            node: node,
          }
        }
      }
      default: {
        throw 'Unsupported node type'
      }
    }
  }
}
