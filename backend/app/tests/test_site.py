"""
Tests for /site/ API.
"""
import random
from fastapi.testclient import TestClient
from utils import create_random_file_content
from main import app
from schemas.site import *
from schemas.navigation import *
from asserts import *
from fixtures import *
import base64

client = TestClient(app)

def test_patch_config_files(file_scenario):
    """
    Tests patching site flair fields (icon, logo, name).
    """
    scenario = file_scenario
    # Patch metadata
    favicon_path = file_scenario.files[0].path
    logo_path = file_scenario.files[1].path
    config_update = ConfigUpdate(
        site_name="Test name",
        favicon_path=favicon_path,
        logo_path=logo_path,
    )
    response = client.patch("/site/config", headers=scenario.admin_token_header, json=config_update.model_dump(exclude_none=True))
    assert is_ok_response(response)

    # Refetch config
    response = client.get("/site/config", headers=scenario.admin_token_header)
    assert is_ok_response(response)

    site = ConfigOutput.model_validate(response.json())
    assert site.site_name == config_update.site_name
    assert site.logo.path == logo_path
    assert site.favicon.path == favicon_path

def test_navigation(file_scenario, article_scenario):
    """
    Tests modifying the site's navigation bar scheme.
    """
    scenario = article_scenario

    # Create navigation schema
    config_update = ConfigUpdate(
        navigation=NavigationUpdate(
            root_nodes=[
                NavigationArticle(category_path=article_scenario.category_path, article_filename=article_scenario.article.filename),
                NavigationCategory(category_path=article_scenario.category_path),
                NavigationNodeExternalLink(
                    url="www.pinewood.team",
                    title="Team Pinewood Main Site"
                ),
                NavigationNodeGroup(
                    children=[
                        NavigationArticle(category_path=article_scenario.category_path, article_filename=article_scenario.article.filename),
                        NavigationCategory(category_path=article_scenario.category_path),
                    ],
                    name="test",
                )
            ]
        )
    )
    response = client.patch("/site/config", headers=scenario.admin_token_header, json=config_update.model_dump(exclude_none=True))
    assert is_ok_response(response)

    site = ConfigOutput.model_validate(response.json())
    nav = site.navigation
    assert len(nav.root_nodes) == 4
    assert nav.root_nodes[0].article.title == article_scenario.article.title
    assert len(nav.root_nodes[3].children) == 2
    assert nav.root_nodes[3].children[1].category.name == article_scenario.category.name

def test_navigation_invalid_paths(file_scenario, article_scenario):
    """
    Tests modifying the site's navigation bar scheme with invalid article/category paths.
    """
    scenario = article_scenario

    # Try invalid category path
    config_update = ConfigUpdate(
        navigation=NavigationUpdate(
            root_nodes=[
                NavigationCategory(category_path="/doesntexist"),
            ]
        )
    )
    response = client.patch("/site/config", headers=scenario.admin_token_header, json=config_update.model_dump(exclude_none=True))
    assert is_bad_request(response, "category")

    # Try invalid category/article path nested in a group
    config_update = ConfigUpdate(
        navigation=NavigationUpdate(
            root_nodes=[
                NavigationNodeGroup(
                    children=[
                        # Bad path nested in group
                        NavigationArticle(category_path="/doesntexist", article_filename="doesntexist"),
                    ],
                    name="test",
                ),
            ]
        )
    )
    response = client.patch("/site/config", headers=scenario.admin_token_header, json=config_update.model_dump(exclude_none=True))
    assert is_bad_request(response, "category")

def test_social_networks(user_scenario):
    """
    Tests toggling which social networks the site allows sharing to.
    """
    scenario = user_scenario

    # Test changing to valid networks
    networks = ["facebook", "x"]
    response = client.patch("/site/config", headers=scenario.admin_token_header, json={
        "social_networks": networks,
    })
    assert is_ok_response(response)
    new_networks = ConfigOutput.model_validate(response.json()).social_networks
    assert set(network.id for network in new_networks.values() if network.can_share) == set(networks)

    # Test invalid network IDs
    response = client.patch("/site/config", headers=scenario.admin_token_header, json={
        "social_networks": ["invalid"],
    })
    assert is_bad_request(response, "invalid")

def test_patch_sidebar(article_scenario):
    """
    Tests patching the site sidebar.
    """
    scenario = article_scenario
    sidebar_content = "Testing *test document*"

    # Patch sidebar
    response = client.patch("/site/config", headers=scenario.admin_token_header, json=ConfigUpdate(
        sidebar_document=sidebar_content,
    ).model_dump(exclude_none=True))
    assert is_ok_response(response)

    # Refetch config
    response = client.get("/site/config", headers=scenario.admin_token_header)
    assert is_ok_response(response)
    site = ConfigOutput.model_validate(response.json())
    assert site.sidebar_document == sidebar_content

    # Fetch sidebar
    response = client.get("/site/sidebar", headers=scenario.admin_token_header)
    assert is_ok_response(response)
    sidebar_output = ConfigSidebarOutput.model_validate(response.json())
    assert sidebar_output.content == sidebar_content
