from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from models.article import ArticleViewEnum # TODO move these enums here?
from models.category import *
from schemas.category_def import CategoryDef
import schemas.user as UserSchema

class ArticleInput(BaseModel):
    filename: str
    title: str
    content: str # Raw document text

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
    path: str
    authors: list[UserSchema.UserOutput]

