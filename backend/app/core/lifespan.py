"""
    Manages app lifespan - the setup & shutdown procedures, before & after requests are handled respectively.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy.orm import Session
from core.config import SessionLocal
from crud.user import create_default_admin
from crud.category import create_root_category

@asynccontextmanager
async def lifespan(app: FastAPI):
    db: Session = SessionLocal()

    # Ensure essential entities exist
    create_default_admin(db)
    create_root_category(db)

    yield
