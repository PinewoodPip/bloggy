from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.config import get_db
from core.utils import get_current_user, get_current_user_optional, get_elastic_search
import schemas.article as ArticleSchemas
import crud.article as ArticleCrud

router = APIRouter()

@router.get("/articles", response_model=ArticleSchemas.ArticleSearchResults)
async def search_articles(text: str, limit: int=5, db: Session=Depends(get_db), es: Elasticsearch=Depends(get_elastic_search)):
    """
    Searches articles of the site.
    """
    # Use "Service unavailable" response if search is disabled
    if not es:
        raise HTTPException(status_code=503, detail="Searching is not currently available")
    try:
        results = ArticleCrud.search_articles(db, es, text=text, limit=limit)
        return ArticleCrud.create_search_output(db, results)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))