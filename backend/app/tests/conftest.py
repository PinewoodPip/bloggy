from dotenv import load_dotenv
import pytest

# Load test config
load_dotenv(dotenv_path="../.test.env")

# Must be imported afterwards, as CONFIG depends on env variables
from utils import get_session
from core.config import CONFIG
import crud.user as UserCrud
import crud.article as ArticleCrud
import crud.category as CategoryCrud
import crud.file as FileCrud
import crud.site as SiteCrud

@pytest.fixture(scope="function", autouse=True)
def db_session():
    """
    Clears the database after every test, ensuring they are self-contained
    without needing to delete created entries explicitly.
    """
    # Clear the DB
    db = get_session()

    # Reset config
    config = SiteCrud.get_config(db)
    config.site_name = "Bloggy site"
    config.logo_file_id = None
    config.favicon_file_id = None
    config.navigation = {"root_nodes": []}
    config.theme = "light"
    config.sidebar_document = None
    db.commit()

    # Remove all users except default admin
    users = UserCrud.get_all(db, None)
    for user in users:
        if UserCrud.get_username(user) != CONFIG.ADMIN_USERNAME:
            UserCrud.delete_user(db, user)

    # Delete all categories
    categories = CategoryCrud.get_all(db)
    for category in categories:
        if category.directory_name != "": # Don't delete root category
            CategoryCrud.delete_category(db, category)
        else:
            CategoryCrud.clear_category(db, category) # Delete articles from root category

    # Delete all files
    files = FileCrud.get_all(db)
    for file in files:
        FileCrud.delete_file(db, file)

    db.close()

    yield # Run test
