"""
    User-related tables.
"""
import typing
from sqlalchemy import Column, Integer, LargeBinary, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped
from models.article import Article
from core.config import Base
if typing.TYPE_CHECKING:
    from models.user import User

class File(Base):
    """
    Table for uploaded files.
    """
    __tablename__ = "files"

    id = Column(Integer, index=True, primary_key=True, unique=True)
    path = Column(String, index=True, unique=True)
    content = Column(LargeBinary)
    uploader_id = Column(String, ForeignKey("users.username"))

    uploader: Mapped["User"] = relationship("User", back_populates="uploaded_files", cascade="all")
