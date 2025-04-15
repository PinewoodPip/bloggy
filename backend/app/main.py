from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from core.lifespan import lifespan
from core.config import engine
from core.config import Base
from routes import user, category, article, file, search, site, comment

# Importing models will have SQLAlchemy recognize them for creation & migration
from models.user import *
from models.category import *
from models.article import *
from models.file import *
from models.site import *

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
app.include_router(comment.router, prefix="/comments", tags=["Comment"])
app.include_router(file.router, prefix="/files", tags=["Files"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(site.router, prefix="/site", tags=["Site"])

# Run uvicorn server if the app is ran directly (ex. via debugger)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)