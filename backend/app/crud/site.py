"""
CRUD methods for site config tables.
"""
from sqlalchemy.orm import Session
import crud.utils as CrudUtils
import crud.file as FileCrud
import crud.category as CategoryCrud
import crud.article as ArticleCrud
from models.site import SiteConfig, SocialNetwork
from schemas.site import *
from schemas.navigation import *
from typing import cast
import json

PATCH_FILE_EXCLUDED_FIELDS = set(["navigation", "favicon_path", "logo_path", "social_networks"])

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
        
    # Update enabled social networks
    if config_update.social_networks != None:
        enabled_networks = set(config_update.social_networks)
        all_networks = get_social_networks(db)

        # Ensure passed IDs are valid
        all_networks_set = set(network.id for network in all_networks)
        if len(enabled_networks - all_networks_set) > 0:
            raise ValueError("One or more network IDs are invalid")

        # Update state of all networks
        for network in all_networks: # Should always be small enough for all() to not matter.
            can_share = network.id in enabled_networks
            update_social_network(db, SocialNetworkUpdate(
                id=network.id,
                can_share=can_share,
            ))

    db.commit()
    db.refresh(config)
    return config

def update_social_network(db: Session, network_update: SocialNetworkUpdate) -> SocialNetwork:
    """
    Updates the settings of a social network.
    """
    network = db.query(SocialNetwork).filter(SocialNetwork.id == network_update.id).first()
    if not network:
        raise ValueError("There is no network with ID " + network_update.id)
    network.can_share = network_update.can_share

    db.commit()
    return network

def register_social_network(db: Session, network_input: SocialNetworkInput):
    """
    Registers a social network that the site's content can be shared to, if one doesn't already exist with the given ID.
    """
    exists = db.query(SocialNetwork).filter(SocialNetwork.id == network_input.id).first()
    if not exists:
        network = SocialNetwork(
            id=network_input.id,
            name=network_input.name
        )
        db.add(network)
        db.commit()

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

def get_social_networks(db: Session) -> list[SocialNetwork]:
    """
    Returns the social networks registered for the site.
    """
    return db.query(SocialNetwork).all()

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
        theme=config.theme,
        logo=logo,
        favicon=favicon,
        navigation=create_navigation_output(db, config.navigation),
        social_networks={
            network.id: create_social_network_output(db, network) for network in get_social_networks(db)
        },
    )

def create_social_network_output(db: Session, network: SocialNetwork) -> SocialNetworkOutput:
    """
    Creates an output schema for a social network's state.
    """
    return CrudUtils.create_schema(network, SocialNetworkOutput)

def parse_navigation_node(db: Session, node: dict) -> NavigationNode:
    """
    Converts the internal representation of a navigation node
    to the user-friendly output schema version. 
    """
    if node["type"] == "group":
        return NavigationNodeGroupOutput(type="group", children=[parse_navigation_node(db, subnode) for subnode in node["children"]], name=node["name"])
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
            "name": node.name,
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