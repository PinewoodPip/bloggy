"""
Schemas for modelling the navigation bar of the site.
"""
from typing import Annotated, Any, Generic, Optional, TypeVar, Union
from pydantic import BaseModel, Discriminator, Tag, field_validator, validator
from schemas.category_preview import CategoryPreview
from schemas.article import ArticlePreview
import enum

"""
Navigation node schemas
"""

class SiteNavigationNodeType(str, enum.Enum):
    group = "group"
    category = "category"
    article = "article"
    external_url = "external_url"

class NavigationNode(BaseModel):
    type: SiteNavigationNodeType

def get_node_discriminator(v: Any) -> str:
    """
    Returns the type of a navigation node.
    """
    if isinstance(v, dict):
        field = v.get('type')
    else:
        field = getattr(v, 'type')
    return field if type(field) == str else field.name

class NavigationNodeGroup(NavigationNode):
    """
    Groups multiple nodes into a list.
    """
    type: SiteNavigationNodeType = SiteNavigationNodeType.group
    children: list[Annotated[
        Union[
            Annotated["NavigationArticle", Tag('article')],
            Annotated["NavigationNodeGroup", Tag('group')],
            Annotated["NavigationCategory", Tag('category')],
            Annotated["NavigationNodeExternalLink", Tag('external_url')],
        ],
        Discriminator(get_node_discriminator),
    ]]

class NavigationNodeGroupOutput(NavigationNode):
    type: SiteNavigationNodeType = SiteNavigationNodeType.group
    children: list[Annotated[
        Union[
            Annotated["NavigationArticleOutput", Tag('article')],
            Annotated["NavigationNodeGroupOutput", Tag('group')],
            Annotated["NavigationCategoryOutput", Tag('category')],
            Annotated["NavigationNodeExternalLink", Tag('external_url')],
        ],
        Discriminator(get_node_discriminator),
    ]]

class NavigationCategory(NavigationNode):
    """
    A node pointing to a category.
    """
    type: SiteNavigationNodeType = SiteNavigationNodeType.category
    category_path: str

class NavigationArticle(NavigationNode):
    """
    A node pointing to an article.
    """
    type: SiteNavigationNodeType = SiteNavigationNodeType.article
    category_path: str
    article_filename: str
    
class NavigationNodeExternalLink(NavigationNode):
    """
    A node pointing to a URL external to the site.
    """
    type: SiteNavigationNodeType = SiteNavigationNodeType.external_url
    title: str
    url: str

class NavigationArticleOutput(NavigationNode):
    type: SiteNavigationNodeType = SiteNavigationNodeType.article
    article: ArticlePreview

class NavigationCategoryOutput(NavigationNode):
    type: SiteNavigationNodeType = SiteNavigationNodeType.category
    category: CategoryPreview

"""
Navigation schemas
"""

class NavigationUpdate(BaseModel):
    root_nodes: list[Annotated[
        Union[
            Annotated[NavigationArticle, Tag('article')],
            Annotated[NavigationNodeGroup, Tag('group')],
            Annotated[NavigationCategory, Tag('category')],
            Annotated[NavigationNodeExternalLink, Tag('external_url')],
        ],
        Discriminator(get_node_discriminator),
    ]]

class NavigationOutput(BaseModel):
    root_nodes: list[NavigationCategoryOutput | NavigationArticleOutput | NavigationNodeGroupOutput | NavigationNodeExternalLink]