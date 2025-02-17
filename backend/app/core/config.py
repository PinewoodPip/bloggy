from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from dataclasses import dataclass, fields
import os

@dataclass
class AppConfig():
    """
        Holds configuration environment values for the app.
    """
    # Default admin credentials
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str

    # DB settings
    DB_NAME: str # Name of the DB to connect to
    DB_ADDRESS: str # Address and port of the DB
    DB_USERNAME: str
    DB_PASSWORD: str

    def __init__(self):
        # Load config from env
        load_dotenv()
        for field in fields(AppConfig): # Assign fields
            setattr(self, field.name, os.getenv(field.name))

CONFIG = AppConfig()

URL_DATABASE = f"postgresql://{CONFIG.DB_USERNAME}:{CONFIG.DB_PASSWORD}@{CONFIG.DB_ADDRESS}/{CONFIG.DB_NAME}"

engine = create_engine(URL_DATABASE)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
