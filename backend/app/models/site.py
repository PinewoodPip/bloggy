
"""
Tables related to the global site configuration.
"""
import typing
from sqlalchemy import Boolean, Column, Integer, LargeBinary, String, ForeignKey, JSON
from sqlalchemy.orm import relationship, Mapped
from core.config import Base
if typing.TYPE_CHECKING:
    from models.file import File
    from models.article import Article

class SiteConfig(Base):
    """
    Table for site-wide configuration settings.
    """
    __tablename__ = "config"

    # Fields
    lock = Column(Integer, index=True, primary_key=True, unique=True)
    site_name = Column(String)
    theme = Column(String, default="light")
    logo_file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    favicon_file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    navigation = Column(JSON)
    sidebar_document_id = Column(Integer, ForeignKey("articles.id"), nullable=True)

    # Relations
    logo: Mapped["File"] = relationship("File", foreign_keys=[logo_file_id])
    favicon: Mapped["File"] = relationship("File", foreign_keys=[favicon_file_id])
    sidebar_document: Mapped["Article"] = relationship("Article")

class SocialNetwork(Base):
    """
    Table for a social network the site admits for sharing.
    """
    __tablename__ = "socialnetworks"

    id = Column(String, index=True, primary_key=True)

    name = Column(String)
    can_share = Column(Boolean, default=False)
    """Whether sharing to this social network is enabled."""