"""
    Article-related tables.
"""
from sqlalchemy import Column, Index, String, ForeignKey, Integer, LargeBinary, DateTime, Boolean, Enum, Table
from sqlalchemy.orm import relationship, Mapped
from core.config import Base
from datetime import datetime, timezone
import typing
import enum
if typing.TYPE_CHECKING:
    from models.category import Category
    from models.user import Editor
    from models.comment import Comment
    from models.file import File

class ArticleViewEnum(str, enum.Enum): # TODO move to schema?
    single_page = "single_page",
    by_sections = "by_sections",

# Auxiliary table for N-N Article-Editor relationship.
# Cascade is set within the relationship of the involved tables.
article_authors = Table(
    "article_authors",
    Base.metadata,
    Column("article_id", ForeignKey("articles.id")),
    Column("author_id", ForeignKey("editors.user_id")),
)

article_tags = Table(
    "article_tags",
    Base.metadata,
    Column("article_id", ForeignKey("articles.id")),
    Column("tag_id", ForeignKey("tags.id")),
)

class Tag(Base):
    """Article text tags."""
    __tablename__ = "tags"
    id = Column(Integer, index=True, primary_key=True, unique=True)
    name = Column(String, index=Index("tag_name_index", postgresql_using="hash"), unique=True)
    
    articles: Mapped[list["Article"]] = relationship(secondary="article_tags", back_populates="tags")

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, index=True, primary_key=True, unique=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    filename = Column(String)
    title = Column(String)

    content = Column(LargeBinary)
    """The published content visible to site readers."""

    draft_content = Column(LargeBinary)
    """Changes to content that are not yet published."""

    creation_time = Column(DateTime, default=lambda: datetime.now(timezone.utc)) # TODO change to server default
    last_edit_time = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    publish_time = Column(DateTime, nullable=True, default=None)
    show_publish_time = Column(Boolean, default=True)
    is_visible = Column(Boolean, default=False)
    view_type = Column(Enum(ArticleViewEnum), default=ArticleViewEnum.single_page)
    can_comment = Column(Boolean, default=False)
    show_authors = Column(Boolean, default=True)
    category_sorting_index = Column(Integer, default=0)
    summary = Column(String)
    # TODO featured image

    category: Mapped["Category"] = relationship("Category", back_populates="articles")
    authors: Mapped[list["Editor"]] = relationship(secondary="article_authors", cascade="all", back_populates="articles")
    comments: Mapped[list["Comment"]] = relationship("Comment", order_by="Comment.post_time", cascade="delete, delete-orphan", back_populates="article")
    tags: Mapped[list["Tag"]] = relationship(secondary="article_tags", cascade="all", back_populates="articles")
