"""
    Article-related tables.
"""
from sqlalchemy import Column, String, ForeignKey, Integer, LargeBinary, DateTime, Boolean, Enum, Table
from sqlalchemy.orm import relationship, Mapped
from core.config import Base
from datetime import datetime, timezone
import typing
import enum
if typing.TYPE_CHECKING:
    from models.category import Category
    from models.user import Editor

class ArticleViewEnum(str, enum.Enum): # TODO move to schema?
    single_page = "single_page",
    by_sections = "by_sections",

# Auxiliary table for N-N Article-Editor relationship.
# Cascade is set within the relationship of the involved tables.
article_authors = Table(
    "article_authors",
    Base.metadata,
    Column("article_id", ForeignKey("articles.id")),
    Column("author_username", ForeignKey("editors.username")),
)

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, index=True, primary_key=True, unique=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    filename = Column(String)
    title = Column(String)
    content = Column(LargeBinary)
    creation_time = Column(DateTime, default=lambda: datetime.now(timezone.utc)) # TODO change to server default
    publish_time = Column(DateTime, nullable=True, default=None)
    show_publish_time = Column(Boolean, default=True)
    is_visible = Column(Boolean, default=False)
    view_type = Column(Enum(ArticleViewEnum), default=ArticleViewEnum.single_page)
    can_comment = Column(Boolean, default=False)
    show_authors = Column(Boolean, default=True)
    category_sorting_index = Column(Integer, default=0)
    # TODO featured image, summary field
    # TODO tags, comments

    category: Mapped["Category"] = relationship("Category", back_populates="articles")
    authors: Mapped[list["Editor"]] = relationship(secondary="article_authors", cascade="all", back_populates="articles")

