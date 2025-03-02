"""
    Manages app lifespan - the setup & shutdown procedures, before & after requests are handled respectively.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy.orm import Session
from core.config import SessionLocal
from models.user import User
from crud.user import create_default_admin
from crud.category import create_root_category
import time

@asynccontextmanager
async def lifespan(app: FastAPI):
    db: Session = SessionLocal()

    # Wait until the database is ready to accept connections
    while True:
        try:
            db.query(User).first()
            break
        except Exception as e:
            print("Database not ready (", str(e), "), retrying in 1 second")
            time.sleep(1)

    # Ensure essential entities exist
    create_default_admin(db)
    create_root_category(db)

    yield
