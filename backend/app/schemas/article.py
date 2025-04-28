from datetime import datetime
from typing import Annotated, Optional
from pydantic import BaseModel, Field, field_validator
from models.article import ArticleViewEnum # TODO move these enums here?
from models.category import *
from schemas.category_preview import CategoryPreview
import schemas.user as UserSchema
import re

INVALID_URL_PATTERN = re.compile(r"[^\w]", re.A) # Catches non-alphanumeric characters (including non-ASCII), except underscore.

class ArticleBase(BaseModel):
    """Base schema class with common validators."""
    @field_validator("filename", check_fields=False)
    def validate_url(cls, filename: str):
        if INVALID_URL_PATTERN.search(filename): # Cannot contain slashes or characters that are reserved or would require url-encoding
            raise ValueError("Invalid filename")
        return filename

    @field_validator("content", check_fields=False)
    def validate_content(cls, content: str):
        if len(content) == 0:
            raise ValueError("Content must be not empty")
        return content
    
class ArticleInput(ArticleBase):
    """Schema for creation requests."""
    filename: Annotated[str, Field(description="Identifier. Must be unique within the article's category. Does not require an extension.")]
    title: str
    content: Annotated[str, Field(description="Markdown-like text content.")]
    text: Annotated[str, Field(description="Raw unformatted text transcript of the article.")]
    summary: Annotated[str, Field(description="Should be unformatted text.")]

class ArticleUpdate(ArticleBase):
    """Schema for patching requests."""
    filename: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None # Raw document text
    is_draft: Optional[bool] = None # If true, the content will be saved as a draft and not published
    featured_image_path: Optional[str] = None
    text: Optional[str] = None
    publish_time: Optional[str] = None # As ISO 8601 date
    is_visible: Optional[bool] = None
    view_type: Optional[ArticleViewEnum] = None
    can_comment: Optional[bool] = None
    show_authors: Optional[bool] = None
    category_sorting_index: Optional[int] = None
    authors: Optional[list[str]] = None # List of usernames
    category_path: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[list[str]] = None

class ArticlePreview(ArticleBase):
    """Schema for basic article metadata, without content fields."""
    id: int
    filename: str
    title: str
    creation_time: datetime
    publish_time: Optional[datetime]
    is_visible: bool
    category_path: str
    category_id: int
    category_name: str
    path: str # Full path to article
    category_sorting_index: int
    authors: list[UserSchema.UserOutput]
    summary: str
    tags: list[str]
    can_comment: bool
    comments_count: int
    featured_image_path: Optional[str]

class ArticleOutput(ArticlePreview):
    """Complete article schema that includes metadata and content."""
    category: CategoryPreview
    content: str # Raw document text
    view_type: ArticleViewEnum
    last_edit_time: Optional[datetime]
    show_authors: bool

class ArticleSearchResults(BaseModel):
    results: list[ArticlePreview]

class ArticleLatestPosts(ArticleSearchResults):
    total_articles: int

class TagOutput(BaseModel):
    """Schema for a tag entity."""
    id: int
    name: str

class TagsOutput(BaseModel):
    """Schema for tags used in articles on the site."""
    tags: list[TagOutput]
