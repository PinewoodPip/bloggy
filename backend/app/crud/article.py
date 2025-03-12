"""
    CRUD methods for article-related tables.
"""
from sqlalchemy.orm import Session
from models.user import Editor
from schemas.article import *
from models.article import *
import crud.user as UserCrud
import crud.category as CategoryCrud
import crud.utils as CrudUtils

PATCH_ARTICLE_EXCLUDED_FIELDS = set(["authors", "category_path"])

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
    )

    # Add initial author
    article.authors.append(author)

    db.add(article)
    db.commit()

    return article

def update_article(db: Session, article: Article, article_update: ArticleUpdate) -> Article:
    """
    Updates an article's data.
    """
    CrudUtils.patch_entity(article, article_update, excluded_fields=PATCH_ARTICLE_EXCLUDED_FIELDS)

    # Update content
    if article_update.content:
        article.content = article_update.content.encode()

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

def create_article_preview(db: Session, article: Article) -> ArticlePreview:
    """
    Creates a preview schema for an article.
    """
    category_path = CategoryCrud.get_category_path(db, article.category)
    return CrudUtils.create_schema(article, ArticlePreview, {
        "category_path": category_path,
        "path": f"{category_path}/{article.filename}",
        "authors": [UserCrud.create_user_output(author.user) for author in article.authors],
    })

def get_article_path(db: Session, article: Article) -> str:
    """
    Returns the URL path to an article.
    """
    category_path = CategoryCrud.get_category_path(db, article.category)
    return f"{category_path}/{article.filename}" if category_path != "/" else f"/{article.filename}" # Avoid extra leading slash

def create_article_output(db: Session, article: Article) -> ArticleOutput:
    """
    Creates an output schema for an article.
    """
    category = article.category
    category_path = CategoryCrud.get_category_path(db, article.category)
    return ArticleOutput(
        id=article.id,
        category=CategoryPreview(
            id=category.id,
            name=category.name,
            directory_name=category.directory_name,
            view_type=CategoryViewEnum[category.view_type.name],
            sorting_type=CategorySortingModeEnum[category.sorting_type.name],
        ),
        filename=article.filename,
        title=article.title,
        content=bytes.decode(article.content),
        view_type=ArticleViewEnum[article.view_type.name],
        can_comment=article.can_comment,
        category_sorting_index=article.category_sorting_index,
        creation_time=article.creation_time,
        is_visible=article.is_visible,
        publish_time=article.publish_time,
        show_authors=article.show_authors,
        authors=[UserCrud.create_user_output(author.user) for author in article.authors],
        category_path=category_path,
        path=get_article_path(db, article),
    )