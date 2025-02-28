"""
    CRUD methods for category-related tables.
"""
from sqlalchemy.orm import Session
from sqlalchemy.inspection import inspect
from schemas.category import *
from models.category import *
from struct import pack

def get_category_by_path(db: Session, path: str) -> Category:
    """
    Returns a category by its full path.
    """
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

        category = db.query(Category).filter(Category.parent_id == parent_category.id and Category.url == url_component).first()
        if not category:
            raise ValueError("There is no category at this path")
        
        categories.append(category)

    return categories[-1]

def create_category(db: Session, category_input: CategoryInput) -> Category:
    """
    Creates a category.
    """
    parent_path = category_input.parent_category_path

    # Determine ID of parent category
    if category_input.url == "": # Special case for root category
        parent_id = None
    else:
        parent_id = get_category_by_path(db, parent_path).id

    category = Category(name=category_input.name, url=category_input.url, parent_id=parent_id)

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
            create_category(db, CategoryInput(name="", parent_category_path="", url=""))

def get_category_path(db: Session, category: Category) -> str:
    """
    Returns the full path to a category.
    """
    if category.parent_id == None: # Root category case
        return "/"
    else:
        # Backtrack upwards to root
        path = [category.url]
        parent = db.query(Category).filter(Category.id == category.parent_id).first()
        while parent:
            path.append(parent.url)
            parent = db.query(Category).filter(Category.id == parent.parent_id).first()

        return "/".join(path[::-1])

def create_category_output(db: Session, category: Category) -> CategoryOutput:
    """
    Creates an output schema for a category.
    """
    return CategoryOutput(
        id=category.id,
        name=category.name,
        url=category.url,
        view_type=CategoryViewEnum[category.view_type.name],
        sorting_type=CategorySortingModeEnum[category.sorting_type.name],
        path=get_category_path(db, category),
        articles=[], # TODO
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