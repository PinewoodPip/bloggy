"""
    Tests for /categories/ API.
"""
from fastapi.testclient import TestClient
from main import app
from models.category import CategorySortingModeEnum
from schemas.category import CategoryInput, CategoryOutput, CategoryUpdate
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

    assert is_ok_response(response)

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

    assert is_ok_response(response)

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

def test_get_category_articles(article_scenario):
    """
    Tests fetching articles of a category.
    """
    db = get_session()

    # Create articles
    articles = [
        article_scenario.article,
        create_random_article(db, article_scenario.category_path),
        create_random_article(db, article_scenario.category_path),
        create_random_article(db, article_scenario.category_path),
        create_random_article(db, article_scenario.category_path),
    ]
    article_names = set([article.filename for article in articles])

    # Retrieve them
    response = client.get(f"/categories/{article_scenario.category_path}", headers=article_scenario.editor_token_header)
    assert is_ok_response(response)
    category_output = CategoryOutput.model_validate(response.json())
    assert len(category_output.articles) == len(articles)
    for fetched_article in category_output.articles:
        assert fetched_article.filename in article_names

    # Test query params
    amount = 3
    skip = 1
    response = client.get(f"/categories/{article_scenario.category_path}?articles_amount={amount}&articles_skip={skip}", headers=article_scenario.editor_token_header)
    assert is_ok_response(response)
    category_output = CategoryOutput.model_validate(response.json())
    assert len(category_output.articles) == amount
    for i in range(skip, skip + amount):
        article = articles[i]
        assert category_output.articles[i - skip].filename == article.filename

    # Test ordering articles manually
    response = client.patch(f"/categories/{article_scenario.category_path[1:]}", headers=article_scenario.editor_token_header, json={
        "sorting_type": CategorySortingModeEnum.manual.name,
    })
    assert is_ok_response(response)
    assert CategoryOutput.model_validate(response.json()).sorting_type == CategorySortingModeEnum.manual
    for i, article in enumerate(articles):
        response = client.patch(f"/articles/{article.path[1:]}", headers=article_scenario.editor_token_header, json={
            "category_sorting_index": len(articles) - i, # Reverse order
        })
        assert is_ok_response(response)
    
    # Expect articles to be ordered in reverse
    response = client.get(f"/categories/{article_scenario.category_path}", headers=article_scenario.editor_token_header)
    assert is_ok_response(response)
    category_output = CategoryOutput.model_validate(response.json())
    for i, fetched_article in enumerate(category_output.articles):
        assert fetched_article.filename == articles[len(articles) - i - 1].filename

def test_category_change_parent(article_scenario):
    """
    Tests changing the parent category.
    """
    db = get_session()
    new_category = create_random_category(db)

    category_update = CategoryUpdate(
        parent_category_path=new_category.path,
    )
    response = client.patch(f"/categories/{article_scenario.category.path[1:]}", headers=article_scenario.editor_token_header, json=category_update.model_dump(exclude_none=True))
    assert is_ok_response(response)
    category_output = CategoryOutput.model_validate(response.json())

    # Attempt to fetch category from old path
    response = client.get(f"/categories/{article_scenario.category.path[1:]}", headers=article_scenario.editor_token_header)
    assert is_not_found(response)

    # Get category from new path
    response = client.get(f"/categories/{category_output.path[1:]}", headers=article_scenario.editor_token_header)
    assert is_ok_response(response)
