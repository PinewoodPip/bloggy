"""
    Common utility methods for tests, mainly to generate dummy data and entities.
"""
import random
import string
from core.config import get_db, engine
from main import app
from fastapi.testclient import TestClient
from schemas.user import UserInput, UserLogin
from crud.user import create_user
from models.user import User

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

def create_random_editor(db):
    return create_user(db, create_random_user_input())

def get_session():
    return next(get_db())

def get_client():
    return TestClient(app)
