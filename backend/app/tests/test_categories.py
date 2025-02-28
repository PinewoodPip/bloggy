"""
    Tests for /categories/ API.
"""
from models.user import User
from schemas.user import UserRole, MIN_USERNAME_LENGTH
from utils import create_random_auth_editor, create_random_editor, create_random_admin, get_session, get_token_header, random_lower_string, random_email, create_random_user_input, random_password
from asserts import has_validation_error, is_bad_request, is_not_found, is_unauthorized_request, response_detail
from fastapi.testclient import TestClient
from core.config import get_db, engine
from main import app
from sqlalchemy.schema import MetaData
from core.config import Base
from utils import RandomEditor
from dataclasses import dataclass
from schemas.category import CategoryInput, CategoryOutput
import pytest

client = TestClient(app)

@dataclass
class CategoryTestScenario:
    admin: RandomEditor
    admin_token_header: dict
    editor: RandomEditor
    editor_token_header: dict

@pytest.fixture
def scenario() -> CategoryTestScenario:
    admin = create_random_admin(get_session())
    admin_header = get_token_header(admin.token)
    
    editor = create_random_auth_editor(get_session())
    editor_header = get_token_header(admin.token)

    return CategoryTestScenario(
        admin=admin,
        admin_token_header=admin_header,
        editor=editor,
        editor_token_header=editor_header,
    )

def test_create_category(scenario):
    """
    Tests creating multiple nested categories.
    """
    # Create a category at root (/)
    category_input = CategoryInput(
        name="new categ",
        url="newcateg",
        parent_category_path="",
    )
    response = client.post("/categories", headers=scenario.editor_token_header, json=category_input.model_dump())

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
    response = client.post("/categories", headers=scenario.editor_token_header, json=category_input.model_dump())

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

def test_invalid_categories(scenario):
    """
    Tests creating categories with invalid inputs.
    """
    # Attempt to create another root category
    response = client.post("/categories", headers=scenario.editor_token_header, json={
        "name": "new root",
        "url": "",
        "parent_category_path": "",
    })
    assert has_validation_error(response, "additional root")
    
    # Try invalid path formats
    response = client.post("/categories", headers=scenario.editor_token_header, json={
        "name": "test",
        "url": "test",
        "parent_category_path": "test//test",
    })
    assert has_validation_error(response, "Invalid path")

    response = client.post("/categories", headers=scenario.editor_token_header, json={
        "name": "test",
        "url": "te/st",
        "parent_category_path": "",
    })
    assert has_validation_error(response, "Invalid url")
