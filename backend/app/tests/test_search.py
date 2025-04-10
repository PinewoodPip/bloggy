"""
Tests for /search/ API endpoints.
"""
from fastapi.testclient import TestClient
from main import app
from schemas.article import ArticleInput, ArticleLatestPosts, ArticleOutput, ArticleUpdate
from utils import create_random_article_post, create_random_editor, random_lower_string
from asserts import *
from fixtures import *

client = TestClient(app)

def test_get_latest_posts(user_scenario):
    """
    Tests fetching latest posts.
    """
    db = get_session()
    ARTICLES_LIMIT = 5

    # Create articles with set publish dates in descending order
    articles = [create_random_article_post(db, "/", -minutes) for minutes in range(6)]

    # Retrieve latest articles
    response = client.get(f"/search/articles/latest?limit={ARTICLES_LIMIT}&skip=0", headers=user_scenario.editor_token_header)
    assert is_ok_response(response)
    articles_output = ArticleLatestPosts.model_validate(response.json())
    assert articles_output.total_articles == len(articles)
    assert len(articles_output.results) == ARTICLES_LIMIT # Check limit param works
    # Assert article order
    for i, article in enumerate(articles_output.results):
        assert article.title == articles[i].title

    # Add unpublished articles
    ADDED_ARTICLES_COUNT = 3
    for i in range(ADDED_ARTICLES_COUNT):
        create_random_article(db, "/")

    # Expect them to not be present in latest article posts
    response = client.get("/search/articles/latest?limit=5&skip=0", headers=user_scenario.editor_token_header)
    assert is_ok_response(response)
    articles_output = ArticleLatestPosts.model_validate(response.json())
    assert articles_output.total_articles == len(articles) # Expect posted article count to NOT have changed
