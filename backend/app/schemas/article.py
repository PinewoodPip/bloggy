from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from models.article import ArticleViewEnum # TODO move these enums here?
from models.category import *
from schemas.category_def import CategoryDef
import schemas.user as UserSchema

class ArticleInput(BaseModel):
    """Schema for creation requests."""
    filename: str
    title: str
    content: str # Raw document text

class ArticleUpdate(BaseModel):
    """Schema for patching requests."""
    filename: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None # Raw document text
    publish_time: Optional[datetime] = None
    is_visible: Optional[bool] = None
    view_type: Optional[ArticleViewEnum] = None
    can_comment: Optional[bool] = None
    show_authors: Optional[bool] = None
    category_sorting_index: Optional[int] = None
    authors: Optional[list[str]] = None # List of usernames
    category_path: Optional[str] = None

class ArticleOutput(BaseModel):
    id: int
    category: CategoryDef
    filename: str
    title: str
    content: str # Raw document text
    creation_time: datetime
    publish_time: Optional[datetime]
    is_visible: bool
    view_type: ArticleViewEnum
    can_comment: bool
    show_authors: bool
    category_sorting_index: int
    path: str # Full path to article
    authors: list[UserSchema.UserOutput]
