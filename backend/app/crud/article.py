"""
    CRUD methods for article-related tables.
"""
from sqlalchemy.orm import Session
from models.user import Editor
from schemas.article import *
from models.article import *
import crud.user as UserCrud
import crud.category as CategoryCrud

def create_article(db: Session, category_path: str, article_input: ArticleInput, author: Editor) -> Article:
    """
    Creates an article.
    """
    # Check if article with the same filename already exists in the category
    article_exists = True
    try:
        get_article_by_path(db, category_path, article_input.filename)
    except:
        article_exists = False
    if article_exists:
        raise ValueError("An article with this filename already exists in the category")

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

def get_article_by_path(db: Session, category_path: str, article_url: str) -> Article:
    """
    Returns an article by its path.
    """
    category = CategoryCrud.get_category_by_path(db, category_path)
    article = db.query(Article).filter(Article.filename == article_url, Article.category_id == category.id).first() # Must have same filename and be within the category
    if not article:
        raise ValueError("There is no article at the path")
    return article

def create_article_output(db: Session, article: Article) -> ArticleOutput:
    """
    Creates an output schema for an article.
    """
    category = article.category
    return ArticleOutput(
        id=article.id,
        category=CategoryDef(
            id=category.id,
            name=category.name,
            url=category.url,
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
        path=CategoryCrud.get_category_path(db, article.category),
    )