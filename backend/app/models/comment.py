"""
Tables for article comments.
"""
from datetime import datetime, timezone
import typing
from sqlalchemy import Column, DateTime, Integer, LargeBinary, String, ForeignKey, Text
from sqlalchemy.orm import relationship, Mapped
from models.article import Article
from core.config import Base
if typing.TYPE_CHECKING:
    from models.user import User

class Comment(Base):
    """
    Table for article comments.
    """
    __tablename__ = "comments"

    id = Column(Integer, index=True, primary_key=True, unique=True)
    content = Column(Text)
    post_time: Mapped[datetime] = Column(DateTime, default=lambda: datetime.now(timezone.utc)) # TODO change to server default
    user_id = Column(Integer, ForeignKey("users.id"))
    article_id = Column(Integer, ForeignKey("articles.id"))
    parent_comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)

    # Relations
    author: Mapped["User"] = relationship("User", back_populates="comments")
    article: Mapped["Article"] = relationship("Article", back_populates="comments")
    parent_comment: Mapped["Comment"] = relationship("Comment", back_populates="replies", remote_side=[id])
    replies: Mapped[list["Comment"]] = relationship("Comment", back_populates="parent_comment", cascade="delete, delete-orphan", order_by=post_time)
