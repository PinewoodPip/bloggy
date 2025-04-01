from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.config import get_db
import schemas.category as CategorySchemas
from core.utils import get_current_user, get_current_user_optional
from models.user import User
import crud.category as CategoryCrud

router = APIRouter()

@router.post("/", response_model=CategorySchemas.CategoryOutput)
async def create_category(category_input: CategorySchemas.CategoryInput, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)): # TODO rework to use catch-all path
    """
    Creates a category.
    """
    try:
        # Prevent creating additional root categories
        if category_input.directory_name == "/":
            raise ValueError("Cannot create additional root categories")

        # TODO permissions system; don't allow editors to create categories under ones they don't have perms for 
        category = CategoryCrud.create_category(db, category_input)
        return CategoryCrud.create_category_output(db, category)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{category_path:path}", response_model=CategorySchemas.CategoryOutput)
async def get_category(category_path: str, articles_amount: int = 5, articles_skip: int = 0, db: Session=Depends(get_db)):
    """
    Fetches a category by its full URL path.
    """
    try:
        category = CategoryCrud.get_category_by_path(db, "/" + category_path)
        return CategoryCrud.create_category_output(db, category, articles_amount, articles_skip)
    except ValueError as e:
        msg = str(e)
        if "at this path" in msg: # Category not found, but path format is valid
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{category_path:path}", response_model=CategorySchemas.CategoryOutput)
async def patch_category(category_path: str, category_update: CategorySchemas.CategoryUpdate, db: Session=Depends(get_db)):
    """
    Patches a category by its full URL path.
    """
    try:
        category = CategoryCrud.get_category_by_path(db, "/" + category_path)
        category = CategoryCrud.update_category(db, category, category_update)
        return CategoryCrud.create_category_output(db, category)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))