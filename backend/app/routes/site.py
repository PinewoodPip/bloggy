from typing import Annotated
from elasticsearch import Elasticsearch
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from core.config import get_db
from core.utils import get_current_user, get_current_user_optional, get_elastic_search
import schemas.site as SiteSchemas
import schemas.navigation as NavigationSchemas
import crud.site as SiteCrud

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
async def get_config(config_update: SiteSchemas.ConfigUpdate, db: Session=Depends(get_db), user: User=Depends(get_current_user)):
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