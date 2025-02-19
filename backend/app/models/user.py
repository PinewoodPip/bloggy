"""
    User-related tables.
"""
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped
from core.config import Base

# User table
class User(Base):
    __tablename__ = "users"

    username = Column(String, index=True, primary_key=True, unique=True)
    hashed_password = Column(String)
    current_token = Column(String, nullable=True, default=None) # JWT token

    editor: Mapped["Editor"] = relationship("Editor", back_populates="user", cascade="all")
    admin: Mapped["Admin"] = relationship("Admin", back_populates="user", cascade="all")

class Admin(Base):
    __tablename__ = "admins"

    # Links back to user
    username = Column(String, ForeignKey('users.username', ondelete="CASCADE", onupdate="CASCADE"), primary_key=True, unique=True, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="admin", cascade="all", single_parent=True)

class Editor(Base):
    __tablename__ = "editors"
    
    # Links back to user
    username = Column(String, ForeignKey('users.username', ondelete="CASCADE", onupdate="CASCADE"), primary_key=True, unique=True, nullable=False)
    
    display_name = Column(String)
    contact_email = Column(String, nullable=True, default=None) # TODO custom validator
    biography = Column(String)

    user: Mapped["User"] = relationship("User", back_populates="editor", cascade="all", single_parent=True)
