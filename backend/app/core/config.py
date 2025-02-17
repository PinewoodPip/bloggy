from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()
DB_USERNAME = os.getenv("DB_USERNAME") # TODO move to a config struct
DB_PASSWORD = os.getenv("DB_PASSWORD")

URL_DATABASE = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@localhost:5433/bloggy" # TODO change for deployment

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
