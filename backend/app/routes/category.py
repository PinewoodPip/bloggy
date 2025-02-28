from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.config import get_db
import schemas.category as CategorySchemas
from core.utils import get_current_user, get_current_user_optional
from models.user import User
import crud.category as CategoryCrud

router = APIRouter()

@router.post("/", response_model=CategorySchemas.CategoryOutput)
async def create_category(category_input: CategorySchemas.CategoryInput, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    """
    Creates a category.
    """
    try:
        # TODO permissions system; don't allow editors to create categories under ones they don't have perms for 
        category = CategoryCrud.create_category(db, category_input)
        return CategoryCrud.create_category_output(db, category)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/{category_path:path}", response_model=CategorySchemas.CategoryOutput)
async def get_category(category_path: str, db: Session=Depends(get_db)):
    """
    Fetches a category by its full URL path.
    """
    try:
        category = CategoryCrud.get_category_by_path(db, category_path)
        return CategoryCrud.create_category_output(db, category)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
