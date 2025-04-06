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
    social_networks: Optional[list[str]] = None

class ConfigOutput(BaseModel):
    """
    Schema for global site configuration.
    """
    site_name: str
    logo: FileOutput | None
    favicon: FileOutput | None

    navigation: NavigationOutput
    """The site's navigation schema."""

    social_networks: list[str]
    """Social networks the site allows sharing to."""

class SocialNetworkInput(BaseModel):
    """
    Schema for registering supported social networks.
    """
    id: str
    name: str

class SocialNetworkUpdate(BaseModel):
    """
    Schema for updating a social network's configuration.
    """
    id: str
    can_share: bool