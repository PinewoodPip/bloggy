"""
    Common utility methods for tests, mainly to generate dummy data and entities.
"""
from sqlalchemy.orm import Session, joinedload, subqueryload
from core.config import get_db, engine
from main import app
from fastapi.testclient import TestClient
from schemas.user import UserInput, UserLogin, UserOutput
from crud.user import create_admin, create_editor, authenticate, create_user_output
from schemas.category import CategoryInput, CategoryOutput
from schemas.article import ArticleInput, ArticleOutput
from schemas.file import FileOutput, FileInput
from models.user import User, Editor, Admin
from dataclasses import dataclass
from typing import Optional
import crud.user as UserCrud
import crud.category as CategoryCrud
import crud.article as ArticleCrud
import crud.file as FileCrud
import base64
import random
import string

class RandomEditor(UserOutput):
    """
        Auxiliary struct to hold data of randomly-generated users.
    """
    password: str # In plain text.
    token: Optional[str] = None # JWT token.

def random_lower_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=10))

def random_password() -> str:
    """
        Creates a random valid password.
    """
    return "".join(random.choices(string.ascii_lowercase, k=8)) + "".join(random.choices(string.digits, k=3)) + "".join(random.choices(string.punctuation, k=3))

def random_email() -> str:
    return f"{random_lower_string()}@{random_lower_string()}.com"

def create_random_user_input() -> UserInput:
    username = random_lower_string()
    display_name = random_lower_string().capitalize()
    pwd = random_password()
    contact_email = random_email()
    biography = random_lower_string()
    return UserInput(username=username, password=pwd, display_name=display_name, contact_email=contact_email, biography=biography)

def create_random_editor(db: Session) -> RandomEditor:
    """
        Creates an editor account.
        Returns the user and their plain-text password.
    """
    user_input = create_random_user_input()
    user = create_editor(db, user_input)
    output = RandomEditor(password=user_input.password, **create_user_output(user).model_dump())
    
    return output

def create_random_auth_editor(db: Session) -> RandomEditor:
    """
        Creates an editor account and signs them in.
        Returns a struct with the user data.
    """
    random_editor = create_random_editor(db)
    _, token = authenticate(db, UserLogin(username=random_editor.username, password=random_editor.password))
    random_editor.token = token
    return random_editor

def create_random_admin(db: Session) -> RandomEditor:
    """
        Creates an admin user and signs them in.
    """
    username, password = random_lower_string(), random_password()
    admin = create_admin(db, username, password)
    _, token = authenticate(db, UserLogin(username=username, password=password))

    output = RandomEditor(password=password, **create_user_output(admin.user).model_dump())
    output.token = token

    return output

def create_random_category(db: Session) -> CategoryOutput:
    """
    Creates a random category under the root category.
    """
    category = CategoryCrud.create_category(db, CategoryInput(
        name=random_lower_string(),
        directory_name=random_lower_string(),
        parent_category_path="/",
    ))
    return CategoryCrud.create_category_output(db, category)

def create_random_article(db: Session, category_path: str) -> ArticleOutput:
    """
    Creates a random article under a category.
    """
    author = create_random_auth_editor(db)
    article = ArticleCrud.create_article(db, category_path, ArticleInput(
        filename=random_lower_string(),
        title=random_lower_string(),
        content="Test content",
        text="A document",
        summary="A test document",
    ), UserCrud.get_by_username(db, author.username).editor)
    return ArticleCrud.create_article_output(db, article)

def create_random_file(db: Session, uploader_username: str) -> FileOutput:
    """
    Creates a file with random bytes.
    """
    uploader = UserCrud.get_by_username(db, uploader_username)
    file_input = FileInput(path="/" + random_lower_string() + ".bin", content=base64.encodebytes(random.randbytes(25)).decode("ascii"))
    file = FileCrud.create_file(db, uploader, file_input)
    return FileCrud.create_file_output(db, file)

def create_random_file_content() -> tuple[bytes, str]:
    """
    Creates random bytes and iits base64 encoded byte string.
    """
    byte_contents = random.randbytes(25)
    encoded = base64.encodebytes(byte_contents).decode("ascii")[:-1] # Ascii decode appends a line break.
    return byte_contents, encoded

def get_token_header(token: str) -> dict:
    """
        Returns a header with the authorization field set to use a JWT token.
    """
    return {"Authorization": f"Bearer {token}"}

def get_session():
    return next(get_db())

def get_client():
    return TestClient(app)
