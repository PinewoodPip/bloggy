from typing import Annotated, Optional
from pydantic import BaseModel, Field, field_validator
from models.category import *
from schemas.category_preview import CategoryPreview
import schemas.user as UserSchema
    
class CommentInput(BaseModel):
    """Schema for creating comments."""
    parent_comment_id: Optional[int] = None
    content: str

class CommentUpdate(BaseModel):
    """Schema for updating comments."""
    content: str

class CommentOutput(BaseModel):
    """Schema for a comment and its replies."""
    id: int
    author: UserSchema.UserOutput
    content: str
    post_time: str
    """As ISO 8601 date."""
    replies: list["CommentOutput"]
    """From latest to oldest."""

class CommentsOutput(BaseModel):
    """Schema for a tree of comments."""
    comments: list[CommentOutput]
