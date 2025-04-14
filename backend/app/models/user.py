"""
    User-related tables.
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped
from models.article import Article
from core.config import Base
import typing
if typing.TYPE_CHECKING:
    from models.comment import Comment

class Credentials(Base):
    __tablename__ = "credentials"

    id = Column(Integer, index=True, primary_key=True) 
    username = Column(String, index=True, unique=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    # TODO 2fa, oAuth token

    # Relations
    user: Mapped["User"] = relationship("User", back_populates="credentials", cascade="delete, delete-orphan", single_parent=True)

# User table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, index=True, primary_key=True)
    current_token = Column(String, nullable=True, default=None) # JWT token
    credentials_id = Column(Integer, ForeignKey('credentials.id', ondelete="CASCADE"))

    # Relations
    credentials: Mapped["Credentials"] = relationship("Credentials", back_populates="user")
    comments: Mapped[list["Comment"]] = relationship("Comment", back_populates="author", cascade="delete, delete-orphan")
    editor: Mapped["Editor"] = relationship("Editor", back_populates="user", cascade="all")
    admin: Mapped["Admin"] = relationship("Admin", back_populates="user", cascade="all")
    uploaded_files = relationship("File", back_populates="uploader")

class Admin(Base):
    __tablename__ = "admins"

    # Links back to user
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE", onupdate="CASCADE"), primary_key=True, unique=True, nullable=False)

    # Relations
    user: Mapped["User"] = relationship("User", back_populates="admin", cascade="all", single_parent=True)

class Editor(Base):
    __tablename__ = "editors"
    
    # Links back to user
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE", onupdate="CASCADE"), primary_key=True, unique=True, nullable=False)
    
    display_name = Column(String)
    contact_email = Column(String, nullable=True, default=None) # TODO custom validator
    biography = Column(String)

    # Relations
    user: Mapped["User"] = relationship("User", back_populates="editor", cascade="all", single_parent=True)
    articles: Mapped[list[Article]] = relationship(secondary="article_authors", back_populates="authors")
