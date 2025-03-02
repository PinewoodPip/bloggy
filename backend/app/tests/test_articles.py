"""
Tests for /articles/ API.
"""
from fastapi.testclient import TestClient
from main import app
from schemas.article import ArticleInput, ArticleOutput
from utils import random_lower_string
from asserts import *
from fixtures import *

client = TestClient(app)

def test_create_article(article_scenario):
    """
    Tests creating and retrieving articles.
    """
    # Create article
    article_input = ArticleInput(
        filename=random_lower_string(),
        title=random_lower_string(),
        content="A document",
    )
    response = client.post(f"/articles/{article_input.filename}", headers=article_scenario.editor_token_header, json=article_input.model_dump())
    assert response.status_code == 200

    # Retrieve article
    response = client.get(f"/articles/{article_input.filename}", headers=article_scenario.editor_token_header)
    article_output = ArticleOutput.model_validate(response.json())
    assert article_output.filename == article_input.filename
    assert article_output.title == article_input.title
    assert article_output.content == article_input.content
    assert article_output.authors[0].username == article_scenario.editor.username # Check article was properly attributed to user

def test_create_article_nonexistent_category(article_scenario):
    """
    Tests creating an article in a category that doesn't exist.
    """
    article_input = ArticleInput(
        filename=random_lower_string(),
        title=random_lower_string(),
        content="A document",
    )
    response = client.post(f"/articles/nonexistent{random_lower_string()}/{article_input.filename}", headers=article_scenario.editor_token_header, json=article_input.model_dump())
    assert is_bad_request(response, "category")

def test_create_article_duplicate_filename(article_scenario):
    """
    Tests creating an article under an already-used filename.
    """
    # Create a valid article
    article_input = ArticleInput(
        filename=random_lower_string(),
        title=random_lower_string(),
        content="A document",
    )
    response = client.post(f"/articles/{article_input.filename}", headers=article_scenario.editor_token_header, json=article_input.model_dump())
    assert response.status_code == 200

    # Create another article under the same filename
    response = client.post(f"/articles/{article_input.filename}", headers=article_scenario.editor_token_header, json=article_input.model_dump())
    assert is_bad_request(response, "already exists")

def test_get_nonexistent_article(article_scenario):
    """
    Tests fetching using a filename that doesn't correspond to any article.
    """
    response = client.get(f"/articles/{random_lower_string()}")
    assert is_not_found(response)

def test_create_article_wrong_role(article_scenario):
    """
    Tests creating an article using an account with the wrong user role.
    """
    # Attempt to create an article as an admin
    article_input = ArticleInput(
        filename=random_lower_string(),
        title=random_lower_string(),
        content="A document",
    )
    response = client.post(f"/articles/{article_input.filename}", headers=article_scenario.admin_token_header, json=article_input.model_dump())
    assert is_unauthorized_request(response, "Only editors")