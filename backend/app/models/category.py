
"""
    Category-related tables.
"""
from sqlalchemy import Column, String, ForeignKey, Integer, Enum
from sqlalchemy.orm import relationship, Mapped
from core.config import Base
import typing
import enum
if typing.TYPE_CHECKING:
    from models.article import Article

class CategoryViewEnum(str, enum.Enum):
    vertical = "vertical",
    grid = "grid",

class CategorySortingModeEnum(str, enum.Enum):
    chronological = "chronological",
    manual = "manual",

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, index=True, primary_key=True, unique=True)
    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=True) # Self-referential relationship
    name = Column(String)
    directory_name = Column(String)
    cached_url = Column(String, nullable=True) # Cached full path to the category
    view_type = Column(Enum(CategoryViewEnum), default=CategoryViewEnum.vertical)
    sorting_type = Column(Enum(CategorySortingModeEnum), default=CategorySortingModeEnum.chronological)
    
    subcategories: Mapped[list["Category"]] = relationship("Category", order_by=name) # Child categories.
    articles: Mapped[list["Article"]] = relationship("Article", back_populates="category", cascade="all")
