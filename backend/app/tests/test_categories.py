"""
    Tests for /categories/ API.
"""
from fastapi.testclient import TestClient
from main import app
from schemas.category import CategoryInput, CategoryOutput
from asserts import *
from fixtures import *

client = TestClient(app)

def test_create_category(user_scenario):
    """
    Tests creating multiple nested categories.
    """
    # Create a category at root (/)
    category_input = CategoryInput(
        name="new categ",
        url="newcateg",
        parent_category_path="",
    )
    response = client.post("/categories", headers=user_scenario.editor_token_header, json=category_input.model_dump())

    assert response.status_code == 200

    category_output = CategoryOutput.model_validate(response.json())
    assert category_output.name == category_input.name
    assert category_output.url == "newcateg"

    # Create a subcategory
    category_input = CategoryInput(
        name="new subcateg",
        url="newsubcateg",
        parent_category_path="newcateg",
    )
    response = client.post("/categories", headers=user_scenario.editor_token_header, json=category_input.model_dump())

    assert response.status_code == 200

    category_output = CategoryOutput.model_validate(response.json())
    assert category_output.name == category_input.name
    assert category_output.url == "newsubcateg"
    assert category_output.path == "/newcateg/newsubcateg"

    # Test fetching the categories
    # Root category
    response = client.get("/categories/")
    category_output = CategoryOutput.model_validate(response.json())
    assert category_output.name == ""
    assert category_output.url == ""
    assert category_output.path == "/"

    # Fetch the created ones
    response = client.get("/categories/newcateg")
    category_output = CategoryOutput.model_validate(response.json())
    assert category_output.name == "new categ"
    assert category_output.url == "newcateg"
    assert category_output.path == "/newcateg"
    
    response = client.get("/categories/newcateg/newsubcateg")
    category_output = CategoryOutput.model_validate(response.json())
    assert category_output.name == "new subcateg"
    assert category_output.url == "newsubcateg"
    assert category_output.path == "/newcateg/newsubcateg"

def test_create_invalid_categories(user_scenario):
    """
    Tests creating categories with invalid inputs.
    """
    # Attempt to create another root category
    response = client.post("/categories", headers=user_scenario.editor_token_header, json={
        "name": "new root",
        "url": "",
        "parent_category_path": "",
    })
    assert is_bad_request(response, "additional root")
    
    # Try invalid path formats
    response = client.post("/categories", headers=user_scenario.editor_token_header, json={
        "name": "test",
        "url": "test",
        "parent_category_path": "test//test",
    })
    assert has_validation_error(response, "Invalid path")

    response = client.post("/categories", headers=user_scenario.editor_token_header, json={
        "name": "test",
        "url": "te/st",
        "parent_category_path": "",
    })
    assert has_validation_error(response, "Invalid url")

    response = client.post("/categories", headers=user_scenario.editor_token_header, json={
        "name": "test",
        "url": "テスト",
        "parent_category_path": "",
    })
    assert has_validation_error(response, "Invalid url")
