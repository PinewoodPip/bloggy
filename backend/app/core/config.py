from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dataclasses import dataclass, fields
import os

@dataclass
class AppConfig():
    """
        Holds configuration environment values for the app.
    """
    # Security settings
    SECRET_KEY: str # JWT encryption key
    ALGORITHM: str # JWT encryption algorithm
    ACCESS_TOKEN_EXPIRE_DAYS: int # Expiration duration for JWT tokens

    # Default admin credentials
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str

    # DB settings
    DB_NAME: str # Name of the DB to connect to
    DB_ADDRESS: str # Address and port of the DB
    DB_USERNAME: str
    DB_PASSWORD: str

    # ElasticSearch credentials
    ES_ENABLED: int
    ES_URL: str # Including port.
    ES_USERNAME: str
    ES_PASSWORD: str

    def __init__(self):
        for field in fields(AppConfig): # Assign fields
            value = os.getenv(field.name)
            if value != None:
                # Convert types
                if field.type == int:
                    value = int(value)
                setattr(self, field.name, value)
            else:
                raise ValueError("A required environment variable is unset: " + field.name)

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
