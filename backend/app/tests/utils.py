"""
    Common utility methods for tests, mainly to generate dummy data and entities.
"""
from sqlalchemy.orm import Session, joinedload, subqueryload
from core.config import get_db, engine
from main import app
from fastapi.testclient import TestClient
from schemas.user import UserInput, UserLogin
from crud.user import create_admin, create_editor, authenticate, create_user_output
from schemas.user import UserOutput
from models.user import User, Editor, Admin
from dataclasses import dataclass
from typing import Optional
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

def random_email() -> str:
    return f"{random_lower_string()}@{random_lower_string()}.com"

def create_random_user_input() -> UserInput:
    username = random_lower_string()
    display_name = random_lower_string().capitalize()
    pwd = random_lower_string()
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
    username, password = random_lower_string(), random_lower_string()
    admin = create_admin(db, username, password)
    _, token = authenticate(db, UserLogin(username=username, password=password))

    output = RandomEditor(password=password, **create_user_output(admin.user).model_dump())
    output.token = token

    return output

def get_token_header(token: str) -> dict:
    """
        Returns a header with the authorization field set to use a JWT token.
    """
    return {"Authorization": f"Bearer {token}"}

def get_session():
    return next(get_db())

def get_client():
    return TestClient(app)
