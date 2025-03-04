"""
    CRUD methods for category-related tables.
"""
from sqlalchemy.orm import Session
from sqlalchemy.inspection import inspect
from schemas.category import *
from models.category import *
from models.article import Article
import crud.article as ArticleCrud
import crud.utils as CrudUtils
from struct import pack

UPDATE_CATEGORY_EXCLUDED_FIELDS = set("parent_category_path")

def get_category_by_path(db: Session, path: str) -> Category:
    """
    Returns a category by its full path.
    """
    # Remove leading slash
    if len(path) > 0 and path[0] == "/":
        path = path[1:]
    root_category = db.query(Category).filter(Category.parent_id == None).first()
    if not root_category:
        raise RuntimeError("There is no root category")

    components = path.split("/") # Split path into category IDs
    if path == "":
        components = []

    # Check all categories along the path exist and have valid parent-child relations
    categories: list[Category] = [root_category] # Start with the root category already in the stack
    for i in range(len(components)):
        url_component = components[i]
        parent_category = categories[-1]

        category = db.query(Category).filter(Category.parent_id == parent_category.id, Category.directory_name == url_component).first()
        if not category:
            raise ValueError("There is no category at this path")
        
        categories.append(category)

    return categories[-1]

def category_exists(db: Session, path: str) -> bool:
    """
    Returns whether a category exists at a path.
    """
    exists = False
    try:
        get_category_by_path(db, path)
        exists = True
    except:
        pass
    return exists

def create_category(db: Session, category_input: CategoryInput) -> Category:
    """
    Creates a category.
    """
    parent_path = category_input.parent_category_path

    if ArticleCrud.article_exists(db, parent_path, category_input.directory_name):
        raise ValueError("An article already exists at this path")

    # Determine ID of parent category
    if category_input.directory_name == "": # Special case for root category
        parent_id = None
    else:
        parent_id = get_category_by_path(db, parent_path).id

    category = Category(
        name=category_input.name,
        directory_name=category_input.directory_name,
        parent_id=parent_id
    )

    db.add(category)
    db.commit()

    return category

def create_root_category(db: Session) -> Category:
    """
    Creates the special root (/) category, if it doesn't already exist.
    """
    try:
        category = get_category_by_path(db, "")
    except RuntimeError as e:
        if "There is no root" in str(e):
            create_category(db, CategoryInput(name="", parent_category_path="", directory_name=""))

def update_category(db: Session, category: Category, category_update: CategoryUpdate) -> Category:
    """
    Updates a category's data.
    """
    CrudUtils.patch_entity(category, category_update, excluded_fields=UPDATE_CATEGORY_EXCLUDED_FIELDS)

    # Update parent category
    if category_update.parent_category_path != None:
        try:
            new_parent = get_category_by_path(db, category_update.parent_category_path)
            category.parent_id = new_parent.id
        except Exception as e:
            db.rollback()
            raise e

    db.commit()
    db.refresh(category)
    return category

def get_category_path(db: Session, category: Category) -> str:
    """
    Returns the full path to a category.
    """
    if category.parent_id == None: # Root category case
        return "/" # TODO this is a bit inconsistent, as other paths do not start with slash
    else:
        # Backtrack upwards to root
        path = [category.url]
        parent = db.query(Category).filter(Category.id == category.parent_id).first()
        while parent:
            path.append(parent.url)
            parent = db.query(Category).filter(Category.id == parent.parent_id).first()

        return "/".join(path[::-1])

def get_category_articles(db: Session, category: Category, amount: int = None, skip: int = 0) -> list[Article]:
    """
    Returns the sorted articles of a category.
    """
    articles_query = db.query(Article).filter(Article.category_id == category.id)

    # Sort articles
    sort_mode = category.sorting_type
    if sort_mode == CategorySortingModeEnum.chronological:
        articles_query = articles_query.order_by(Article.publish_time, Article.creation_time)
    elif sort_mode == CategorySortingModeEnum.manual:
        articles_query = articles_query.order_by(Article.category_sorting_index)

    # Apply limit and skip
    if amount != None:
        articles_query = articles_query.limit(amount)
    articles_query = articles_query.offset(skip)

    return articles_query.all()

def create_category_output(db: Session, category: Category, articles_amount: int = None, articles_skip: int = 0) -> CategoryOutput:
    """
    Creates an output schema for a category.
    """
    
    articles = [ArticleCrud.create_article_preview(db, article) for article in get_category_articles(db, category, articles_amount, articles_skip)]
    subcategories = [create_category_output(db, subcategory) for subcategory in category.subcategories]

    return CategoryOutput(
        id=category.id,
        name=category.name,
        url=category.url,
        view_type=CategoryViewEnum[category.view_type.name],
        sorting_type=CategorySortingModeEnum[category.sorting_type.name],
        path=get_category_path(db, category),
        articles=articles,
        subcategories=subcategories,
    )

def get_all(db: Session) -> list[Category]:
    """
    Returns all categories.
    """
    categories = db.query(Category).all()
    return categories

def delete_category(db: Session, category: Category):
    """
        Deletes a category and all its articles.
    """
    # TODO articles, if not cascade
    db.delete(category)
    db.commit()