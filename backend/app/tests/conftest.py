from dotenv import load_dotenv
import pytest

# Load test config
load_dotenv(dotenv_path="../.test.env")

# Must be imported afterwards, as CONFIG depends on env variables
from utils import get_session
from core.config import CONFIG
import crud.user as UserCrud

@pytest.fixture(scope="function", autouse=True)
def db_session():
    """
    Clears the database after every test, ensuring they are self-contained
    without needing to delete created entries explicitly.
    """

    yield # Run test first

    db = get_session()

    # Remove all users except default admin
    users = UserCrud.get_all(db, None)
    for user in users:
        if user.username != CONFIG.ADMIN_USERNAME:
            UserCrud.delete_user(db, user)
