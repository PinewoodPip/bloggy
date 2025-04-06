"""
CRUD methods for Files table.
"""
from sqlalchemy.orm import Session
import crud.utils as CrudUtils
import crud.file as FileCrud
import crud.category as CategoryCrud
import crud.article as ArticleCrud
from models.site import SiteConfig
from schemas.site import *
from schemas.navigation import *
from typing import cast
import json

PATCH_FILE_EXCLUDED_FIELDS = set(["navigation", "favicon_path", "logo_path"])

def get_config(db: Session) -> SiteConfig:
    """
    Returns the site's configuration.
    """
    return db.query(SiteConfig).first()
        
def update_config(db: Session, config_update: ConfigUpdate) -> SiteConfig:
    """
    Updates the site's config.
    """
    config = get_config(db)

    CrudUtils.patch_entity(config, config_update, PATCH_FILE_EXCLUDED_FIELDS)

    # Patch files
    try:
        if config_update.logo_path:
            logo = FileCrud.get_by_path(db, config_update.logo_path)
            config.logo = logo
        if config_update.favicon_path:
            favicon = FileCrud.get_by_path(db, config_update.favicon_path)
            config.favicon = favicon
    except Exception as e:
        db.rollback()
        raise e

    # Patch navigation
    if config_update.navigation:
        try:
            navigation_json = {
                "root_nodes": [serialize_navigation_node(db, subnode) for subnode in config_update.navigation.root_nodes],
            }
            config.navigation = navigation_json
        except Exception as e:
            db.rollback()
            raise e

    db.commit()
    db.refresh(config)
    return config

def try_create_config(db: Session) -> SiteConfig:
    """
    Creates the default config for the site,
    if there isn't one already.
    """
    if not get_config(db):
        config = SiteConfig(
            site_name="Bloggy site",
            navigation={
                "root_nodes": [],
            }
        )
        db.add(config)
        db.commit()

def create_navigation_output(db: Session, navigation: dict) -> NavigationOutput:
    """
    Returns the schema for the site's navigation bar.
    """
    return NavigationOutput(
        root_nodes=[parse_navigation_node(db, subnode) for subnode in navigation["root_nodes"]]
    )

def create_configuration_output(db: Session, config: SiteConfig) -> ConfigOutput:
    """
    Creates an output schema for a site config.
    """
    logo = FileCrud.create_file_output(db, config.logo) if config.logo else None
    favicon = FileCrud.create_file_output(db, config.favicon) if config.favicon else None
    return ConfigOutput(
        site_name=config.site_name,
        logo=logo,
        favicon=favicon,
        navigation=create_navigation_output(db, config.navigation)
    )

def parse_navigation_node(db: Session, node: dict) -> NavigationNode:
    """
    Converts the internal representation of a navigation node
    to the user-friendly output schema version. 
    """
    if node["type"] == "group":
        return NavigationNodeGroupOutput(type="group", children=[parse_navigation_node(db, subnode) for subnode in node["children"]])
    elif node["type"] == "category":
        category = CategoryCrud.get_by_id(db, node["category_id"])
        return NavigationCategoryOutput(type="category", category=CategoryCrud.create_category_output(db, category, 0))
    elif node["type"] == "article":
        article = ArticleCrud.get_by_id(db, node["article_id"])
        return NavigationArticleOutput(type="article", article=ArticleCrud.create_article_preview(db, article))
    elif node["type"] == "external_url":
        return NavigationNodeExternalLink(**node)
    else:
        raise ValueError("Unimplemented navigation node type " + node["type"])

def serialize_navigation_node(db: Session, node: NavigationNode) -> dict:
    """
    Converts a user-friendly navigation node to its counterpart that uses database IDs.
    """
    if node.type == "group":
        node = cast(NavigationNodeGroup, node)
        return {
            "type": "group",
            "children": [serialize_navigation_node(db, subnode) for subnode in node.children],
        }
    elif node.type == "category":
        node = cast(NavigationCategory, node)
        category = CategoryCrud.get_category_by_path(db, node.category_path)
        return {
            "type": "category",
            "category_id": category.id,
        }
    elif node.type == "article":
        node = cast(NavigationArticle, node)
        article = ArticleCrud.get_article_by_path(db, node.category_path, node.article_filename)
        return {
            "type": "article",
            "article_id": article.id,
        }
    elif node.type == "external_url":
        return node.model_dump()
    else:
        raise ValueError("Unimplemented navigation node type " + node.type)