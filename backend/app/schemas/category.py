"""
    Schemas for /categories/ API.
"""
from typing import Optional
from pydantic import BaseModel, field_validator
from models.category import *
from schemas.article import ArticleOutput, ArticlePreview
from schemas.category_preview import CategoryPreview
import re

INVALID_URL_PATTERN = re.compile(r"[^\w]", re.A) # Catches non-alphanumeric characters (including non-ASCII), except underscore.

class CategoryInput(BaseModel):
    """Schema for creation requests."""
    name: str # User-friendly title
    description: Optional[str] = ""
    directory_name: str # The last URL component of the path
    parent_category_path: str # Path to parent category
    
    @field_validator("directory_name", check_fields=False)
    def validate_url(cls, url: str):
        if INVALID_URL_PATTERN.search(url): # Cannot contain slashes or characters that are reserved or would require url-encoding
            raise ValueError("Invalid directory name")

        return url
    
    @field_validator("parent_category_path", check_fields=False)
    def validate_category_parent_path(cls, path: str):
        # Prevent creating additional root categories
        if path.find("//") != -1 or (len(path) > 1 and path[-1] == "/") or (path == "" or path[0] != "/"): # Cannot have 2 consecutive slashes or end in a slash (except the root path "/")
            raise ValueError("Invalid path")
        return path
    
class CategoryUpdate(BaseModel):
    """Schema for patching requests."""
    name: Optional[str] = None
    description: Optional[str] = None
    directory_name: Optional[str] = None
    view_type: Optional[CategoryViewEnum] = None
    sorting_type: Optional[CategorySortingModeEnum] = None
    parent_category_path: Optional[str] = None

class CategoryOutput(CategoryPreview):
    """Schema with a complete view of the category's data."""
    articles: list[ArticlePreview]
    total_articles: int # Total amount of articles regardless of pagination limits applied to the articles field.
    subcategories: list["CategoryOutput"] # Child categories, recursive.