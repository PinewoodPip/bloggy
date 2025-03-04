from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.config import get_db
from core.utils import get_current_user, get_current_user_optional
from models.user import User
import schemas.article as ArticleSchemas
import crud.article as ArticleCrud

router = APIRouter()

def _create_article(db: Session, user: User, category_path: str, article_input: ArticleSchemas.ArticleInput) -> ArticleSchemas.ArticleOutput:
    """
    Auxiliary function for creating an article.
    """
    try:
        # Check user role
        if not user.editor:
            raise HTTPException(status_code=401, detail="Only editors can create articles")
        
        # TODO permissions system; don't allow editors to create articles under categories they don't have perms for 
        article = ArticleCrud.create_article(db, category_path, article_input, user.editor)
        return ArticleCrud.create_article_output(db, article)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

def _get_article(db: Session, category_path: str, article_url: str) -> ArticleSchemas.ArticleOutput:
    """
    Auxiliary function for fetching an article.
    """
    try:
        article = ArticleCrud.get_article_by_path(db, category_path, article_url)
        return ArticleCrud.create_article_output(db, article)
    except ValueError as e:
        msg = str(e)
        if "There is no article at the path" in msg:
            raise HTTPException(status_code=404, detail=msg)
        else: # Category being invalid is considered user error
            raise HTTPException(status_code=400, detail=msg)

def _patch_article(db: Session, category_path: str, article_url: str, article_update: ArticleSchemas.ArticleUpdate) -> ArticleSchemas.ArticleOutput:
    """
    Patches an article's data.
    """
    try:
        # TODO should any author be allowed to change all authors?
        if article_update.authors != None and len(article_update.authors) == 0:
            raise HTTPException(status_code=400, detail="Article must have at least 1 author")

        article = ArticleCrud.get_article_by_path(db, category_path, article_url)
        article = ArticleCrud.update_article(db, article, article_update)
        return ArticleCrud.create_article_output(db, article)
    except ValueError as e:
        msg = str(e)
        if "There is no article at the path" in msg:
            raise HTTPException(status_code=404, detail=msg)
        else: # Category being invalid is considered user error
            raise HTTPException(status_code=400, detail=msg)

@router.post("/{category_path:path}/{article_url}", response_model=ArticleSchemas.ArticleOutput)
async def create_article(category_path: str, article_input: ArticleSchemas.ArticleInput, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    """
    Creates an article at a category.
    """
    return _create_article(db, current_user, "/" + category_path, article_input)

@router.post("/{article_url}", response_model=ArticleSchemas.ArticleOutput)
async def create_article_at_root(article_input: ArticleSchemas.ArticleInput, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    """
    Creates an article at the root category.
    It's necessary for this to be a separate endpoint,
    as the catch-all syntax will not catch POSTs to root of the endpoint collection.
    """
    return _create_article(db, current_user, "/", article_input)

@router.get("/{category_path:path}/{article_url}", response_model=ArticleSchemas.ArticleOutput) # Automatically splits out the last part of the path.
async def get_article(category_path: str, article_url: str, db: Session=Depends(get_db)):
    """
    Fetches an article by its full URL path.
    """
    return _get_article(db, "/" + category_path, article_url)

@router.get("/{article_url}", response_model=ArticleSchemas.ArticleOutput)
async def get_article_at_root(article_url: str, db: Session=Depends(get_db)):
    """
    Fetches an article at the root category.
    It's necessary for this to be a separate endpoint,
    as the catch-all syntax will not catch GETs to root of the endpoint collection.
    """
    return _get_article(db, "/", article_url)

@router.patch("/{category_path:path}/{article_url}", response_model=ArticleSchemas.ArticleOutput)
async def patch_article(category_path: str, article_url: str, article_update: ArticleSchemas.ArticleUpdate, db: Session=Depends(get_db)):
    """
    Patches an article by its full URL path.
    """
    return _patch_article(db, "/" + category_path, article_url, article_update)

@router.patch("/{article_url}", response_model=ArticleSchemas.ArticleOutput)
async def get_article_at_root(article_url: str, article_update: ArticleSchemas.ArticleUpdate, db: Session=Depends(get_db)):
    """
    Patches an article at the root category.
    It's necessary for this to be a separate endpoint,
    as the catch-all syntax will not catch GETs to root of the endpoint collection.
    """
    return _patch_article(db, "/", article_url, article_update)
