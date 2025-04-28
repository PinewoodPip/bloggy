"""
    CRUD methods for article-related tables.
"""
from elasticsearch import Elasticsearch
from sqlalchemy.orm import Session
from models.user import Editor
from schemas.article import *
from models.article import *
import crud.user as UserCrud
import crud.category as CategoryCrud
import crud.utils as CrudUtils
from datetime import datetime
import warnings
import re

PATCH_ARTICLE_EXCLUDED_FIELDS = set(["authors", "category_path", "publish_time", "tags", "draft_content", "content"])
SPLIT_CATEGORY_ARTICLE_PATH_REGEX = re.compile(r"(.+)\/([^\/]+)$") # Splits a path into category path and article filename.

def create_article(db: Session, category_path: str, article_input: ArticleInput, author: Editor) -> Article:
    """
    Creates an article.
    """
    # Check if article with the same filename already exists in the category
    if article_exists(db, category_path, article_input.filename):
        raise ValueError("An article with this filename already exists in the category")
    
    # Check for name conflicts with categories
    if CategoryCrud.category_exists(db, CrudUtils.concatenate_path(category_path, article_input.filename)):
        raise ValueError("A category already exists at this path")

    category = CategoryCrud.get_category_by_path(db, category_path)

    article = Article(
        category_id=category.id,
        filename=article_input.filename,
        title=article_input.title,
        content=article_input.content.encode(),
        draft_content=article_input.content.encode(), # Initialize draft to keep it in sync with published content
        summary=article_input.summary,
    )

    # Add initial author
    article.authors.append(author)

    # Add to the transaction & flush to assign ID, since it's necessary for ES
    db.add(article)
    db.flush()

    db.commit()

    return article

def try_create_tags(db: Session, tags: list[str]) -> list[Tag]:
    """
    Creates tag objects from a list of tag names, if they don't exist already.
    Returns the objects of all tags, including ones that already existed.
    """
    tag_objects = []
    for name in tags:
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(
                name=name,
            )
            db.add(tag)
        tag_objects.append(tag)
    db.flush()
    return tag_objects

def get_tags_by_name(db: Session, tags: list[str]) -> list[Tag]:
    """
    Returns tag objects by their name.
    """
    tag_objects = []
    for name in tags:
        tag = db.query(Tag).filter(Tag.name == name).first()
        if tag:
            tag_objects.append(tag)
        else:
            raise ValueError("Tag not found with name " + name)
    return tag_objects

def get_all_tags(db: Session) -> list[Tag]:
    """
    Returns all tags that have been used on the site.
    """
    return db.query(Tag).all()

def update_article(db: Session, article: Article, article_update: ArticleUpdate) -> Article:
    """
    Updates an article's data.
    """
    CrudUtils.patch_entity(article, article_update, excluded_fields=PATCH_ARTICLE_EXCLUDED_FIELDS)

    # Update content
    if article_update.content:
        # Update published content
        if not article_update.is_draft:
            article.content = article_update.content.encode()
        article.draft_content = article_update.content.encode() # Always update draft, so it stays in sync with the published content

        # Update edit timestamp
        article.last_edit_time = datetime.now(timezone.utc)

    # Update authors
    if article_update.authors:
        authors = [UserCrud.get_by_username(db, username).editor for username in article_update.authors]
        if None in authors: # If None is present, then some user is missing the editor role
            db.rollback()
            raise ValueError("All authors must be editors")

        article.authors = authors

    # Update parent category
    if article_update.category_path != None:
        try:
            category = CategoryCrud.get_category_by_path(db, article_update.category_path)
            article.category = category
        except Exception as e:
            db.rollback()
            raise e
        
    # Update publishing time
    if article_update.publish_time != None:
        article.publish_time = datetime.fromisoformat(article_update.publish_time)

    # Update tags
    if article_update.tags != None:
        tag_list = try_create_tags(db, article_update.tags)
        article.tags = tag_list

    db.commit()
    db.refresh(article)
    return article

def get_article_by_path(db: Session, category_path: str, article_url: str) -> Article:
    """
    Returns an article by its path.
    """
    category = CategoryCrud.get_category_by_path(db, category_path)
    article = db.query(Article).filter(Article.filename == article_url, Article.category_id == category.id).first() # Must have same filename and be within the category
    if not article:
        raise ValueError("There is no article at the path")
    return article

def get_article_by_full_path(db: Session, path: str) -> Article:
    """
    Returns an article by its full path.
    """
    match = SPLIT_CATEGORY_ARTICLE_PATH_REGEX.match(path)
    article = None
    if match:
        category_path, filename = match.groups()
        article = get_article_by_path(db, category_path, filename)
    if not article:
        raise ValueError("Invalid path")
    return article

def get_article(db: Session, article_id: int) -> Article:
    """
    Returns an article by ID.
    """
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise ValueError("There is no article with that ID")
    return article

def article_exists(db: Session, category_path: str, article_filename: str) -> bool:
    """
    Returns whether an article exists at a path.
    """
    has_article = False
    try:
        get_article_by_path(db, category_path, article_filename)
        has_article = True
    except:
        pass
    return has_article

def search_articles(db: Session, es: Elasticsearch, text: str | None, tags: list[str] | None, authors: list[str] | None, limit: int) -> list[Article]:
    """
    Searches articles by text content.
    """
    query_should_clause = []
    # Text queries (title, content, etc.)
    if text:
        query_should_clause.append({
            "multi_match": {
                "query": text,
                "type": "phrase_prefix",
                "fields": ["title", "content", "summary", "authors"],
            }
        })
    # Tag keyword query
    if tags:
        query_should_clause.extend(
            {
                "multi_match": {
                    "query": tag,
                    "type": "phrase",
                    "fields": ["tags"],
                }
            }
        for tag in tags)
    # Authors query
    if authors:
        query_should_clause.extend({
            "multi_match": {
                "query": author,
                "type": "phrase",
                "fields": ["authors"],
            }
        } for author in authors)

    query = {
        "bool": {
            "should": query_should_clause,
        }
    }
    results = es.search(index="articles", query=query, size=limit)

    # Fetch articles in DB
    articles: list[Article] = []
    for hit in results["hits"]["hits"]:
        article_id = hit["_id"]
        article = db.query(Article).filter(Article.id == article_id).first()
        if article:
            articles.append(article)
        else:
            warnings.warn(f"Article document exists in ES but not in DB? {article_id}")
    return articles

def get_latest_articles(db: Session, limit: int, skip: int) -> list[Article]:
    """
    Returns the latest published articles of the site.
    """
    articles = db.query(Article).filter(Article.is_visible == True, Article.publish_time != None).order_by(Article.publish_time.desc()).limit(limit).offset(skip)
    return articles

def index_article_in_search(es: Elasticsearch, article: Article, text_content: str):
    """
    Indexes an article in ElasticSearch.

    text_content is expected to be a raw transcript (no formatting).
    """
    es.index(index="articles", id=str(article.id), document=create_elasticsearch_document(article, text_content))

def update_article_in_search(es: Elasticsearch, article: Article, text_content: str):
    """
    Updates an article in ElasticSearch.
    
    text_content is expected to be a raw transcript (no formatting).
    """
    es.update(index="articles", id=str(article.id), doc=create_elasticsearch_document(article, text_content))

def create_tags_name_list(tags: list[Tag]) -> list[str]:
    """
    Creates a list of names of the passed tags.
    """
    return [tag.name for tag in tags]

def create_tags_output(db: Session, tags: list[Tag]) -> TagsOutput:
    """
    Creates an output schema for a list of tags.
    """
    return TagsOutput(
        tags=[CrudUtils.create_schema(tag, TagOutput) for tag in tags]
    )

def create_article_preview(db: Session, article: Article) -> ArticlePreview:
    """
    Creates a preview schema for an article.
    """
    category_path = CategoryCrud.get_category_path(db, article.category)
    return CrudUtils.create_schema(article, ArticlePreview, {
        "category_path": category_path,
        "category_name": article.category.name,
        "category_id": article.category.id,
        "path": get_article_path(db, article),
        "authors": [UserCrud.create_user_output(author.user) for author in article.authors],
        "tags": create_tags_name_list(article.tags),
        "comments_count": len(article.comments),
    })

def get_article_path(db: Session, article: Article) -> str:
    """
    Returns the URL path to an article.
    """
    category_path = CategoryCrud.get_category_path(db, article.category)
    return f"{category_path}/{article.filename}" if category_path != "/" else f"/{article.filename}" # Avoid extra leading slash

def get_by_id(db: Session, id: int) -> Category:
    """
    Returns an article by its ID.
    """
    article = db.query(Article).filter(Article.id == id).first()
    if not article:
        raise ValueError("There is no article with that ID")
    return article

def get_total_posted_articles(db: Session) -> int:
    """
    Returns the amount of visible published articles.
    """
    return db.query(Article).filter(Article.is_visible, Article.publish_time != None).count()

def create_elasticsearch_document(article: Article, text_content: str) -> dict:
    """
    Creates an ES document for an article.
    """
    return {
        "title": article.title,
        "content": text_content,
        "summary": article.summary,
        "authors": [author.display_name for author in article.authors],
        "tags": [tag.name for tag in article.tags],
    }

def create_article_output(db: Session, article: Article, is_draft: bool=False) -> ArticleOutput:
    """
    Creates an output schema for an article.
    """
    category = article.category
    category_path = CategoryCrud.get_category_path(db, article.category)
    return ArticleOutput(
        category=CategoryPreview(
            id=category.id,
            name=category.name,
            path=category_path,
            description=category.description,
            directory_name=category.directory_name,
            view_type=CategoryViewEnum[category.view_type.name],
            sorting_type=CategorySortingModeEnum[category.sorting_type.name],
        ),
        content=bytes.decode(article.draft_content if is_draft else article.content),
        view_type=ArticleViewEnum[article.view_type.name],
        last_edit_time=article.last_edit_time,
        show_authors=article.show_authors,
        **create_article_preview(db, article).model_dump(),
    )

def create_search_output(db: Session, search_results: list[Article]) -> ArticleSearchResults:
    """
    Creates an output schema for article search results.
    """
    return ArticleSearchResults(
        results=[create_article_preview(db, article) for article in search_results],
    )

def create_latest_articles_output(db: Session, articles: list[Article]) -> ArticleLatestPosts:
    return ArticleLatestPosts(
        results=[create_article_preview(db, article) for article in articles],
        total_articles=get_total_posted_articles(db),
    )