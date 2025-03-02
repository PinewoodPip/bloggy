from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.lifespan import lifespan
from core.config import engine
from core.config import Base
from routes import user, category, article

# Importing models will have SQLAlchemy recognize them for creation & migration
from models.user import *
from models.category import *
from models.article import *

# Initialize app
app = FastAPI(lifespan=lifespan)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins, change this to specific domains in production
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

# Create or migrate database tables on startup
Base.metadata.create_all(bind=engine)

# Define routes
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(category.router, prefix="/categories", tags=["Categories"])
app.include_router(article.router, prefix="/articles", tags=["Articles"])
