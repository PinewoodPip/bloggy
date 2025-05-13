from typing import Annotated
from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from models.user import User
from core.config import get_db
from core.utils import get_current_user, get_current_user_optional, get_elastic_search
import schemas.site as SiteSchemas
import schemas.article as ArticleSchemas
import schemas.navigation as NavigationSchemas
import crud.site as SiteCrud
import crud.article as ArticleCrud

router = APIRouter()

@router.get("/config", response_model=SiteCrud.ConfigOutput)
async def get_config(db: Session=Depends(get_db)):
    """
    Returns the site's global configuration.
    """
    try:
        config = SiteCrud.get_config(db)
        return SiteCrud.create_configuration_output(db, config)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.patch("/config", response_model=SiteCrud.ConfigOutput)
async def patch_config(config_update: SiteSchemas.ConfigUpdate, db: Session=Depends(get_db), user: User=Depends(get_current_user)):
    """
    Patches the site's global configuration.
    """
    try:
        # Privilege check
        if not user.admin:
            raise HTTPException(status_code=403, detail="Only admins can change the site config")
        config = SiteCrud.update_config(db, config_update)
        return SiteCrud.create_configuration_output(db, config)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/sidebar", response_model=SiteSchemas.ConfigSidebarOutput)
async def get_sidebar(db: Session=Depends(get_db)):
    """
    Returns the site's sidebar document.
    """
    try:
        config = SiteCrud.get_config(db)
        if not config.sidebar_document:
            raise HTTPException(status_code=404)
        return SiteSchemas.ConfigSidebarOutput(content=config.sidebar_document)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/favicon",
    response_class=Response, # Necessary for Swagger to not show an an extra "application/json" return type
    responses = {
        200: {
            "content": {"image/png": {}}
        }
    }
)
async def get_favicon(db: Session=Depends(get_db)):
    """
    Returns the site's favicon.
    """
    config = SiteCrud.get_config(db)
    if config.favicon:
        # Send raw image data
        data = config.favicon.content
        response = Response(content=data, media_type="image/png", status_code=200)
        return response
    raise HTTPException(status_code=404)

@router.get(
    "/logo",
    response_class=Response, # Necessary for Swagger to not show an an extra "application/json" return type
    responses = {
        200: {
            "content": {"image/png": {}}
        }
    }
)
async def get_logo(db: Session=Depends(get_db)):
    """
    Returns the site's logo.
    """
    config = SiteCrud.get_config(db)
    if config.logo:
        # Send raw image data
        data = config.logo.content
        response = Response(content=data, media_type="image/png", status_code=200)
        return response
    raise HTTPException(status_code=404)