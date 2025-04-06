"""
Schemas for site-wide configuration settings.
"""
from typing import Optional
from pydantic import BaseModel, field_validator
from schemas.file import FileOutput
from schemas.navigation import NavigationUpdate, NavigationOutput

class ConfigUpdate(BaseModel):
    """
    Schema for updating the site config.
    """
    site_name: Optional[str] = None
    favicon_path: Optional[str] = None
    logo_path: Optional[str] = None
    navigation: Optional[NavigationUpdate] = None

class ConfigOutput(BaseModel):
    """
    Schema for global site configuration.
    """
    site_name: str
    logo: FileOutput | None
    favicon: FileOutput | None
    navigation: NavigationOutput
