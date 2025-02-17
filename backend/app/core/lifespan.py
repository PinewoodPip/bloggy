"""
    Manages app lifespan - the setup & shutdown procedures, before & after requests are handled respectively.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy.orm import Session
from core.config import SessionLocal
from crud.user import create_default_admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure admin account exists
    db: Session = SessionLocal()
    create_default_admin(db)
    
    yield
