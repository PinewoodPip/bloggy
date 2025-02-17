"""
    Tests for /users/ API.
"""
from models.user import User
from schemas.user import UserRole, MIN_USERNAME_LENGTH
from utils import random_lower_string, random_email, create_random_user_input
from fastapi.testclient import TestClient
from core.config import get_db, engine
from main import app
from sqlalchemy.schema import MetaData
from core.config import Base

client = TestClient(app)

def test_create_editor():
    # Create the user
    user_input = create_random_user_input()

    response = client.post("/users", json=user_input.model_dump())

    # Check response
    assert response.status_code == 200
    json = response.json()
    assert json['username'] == user_input.username
    assert json['role'] == UserRole.editor.name # This endpoint only creates editor accounts
    assert json['contact_email'] == user_input.contact_email
    assert json['biography'] == user_input.biography

    # Ensure the user can be fetched
    response = client.get(f"/users/{user_input.username}")
    assert response.status_code == 200
    new_json = response.json()
    for k,v in new_json.items():
        assert v == json[k]

def test_create_editor_duplicate_username():
    # Create a user
    user_input = create_random_user_input()
    response = client.post("/users", json=user_input.model_dump())

    # Ensure first user creation passes
    assert response.status_code == 200

    # Attempt to create another user with same username
    response = client.post("/users", json=user_input.model_dump())
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_create_user_invalid_username():
    # Try to create a user with a short name
    user_input = create_random_user_input()
    user_input.username = "a" * (MIN_USERNAME_LENGTH - 1) # Right below min length
    response = client.post("/users", json=user_input.model_dump())

    assert response.status_code == 422
    assert "too short" in response.json()["detail"][0]["msg"]

def test_create_user_invalid_email():

    # Create a new user with an invalid email
    user_input = create_random_user_input()
    user_input.contact_email = "NotAValidEmail"
    response = client.post("/users", json=user_input.model_dump())

    # Check object returned
    assert response.status_code == 422
    assert "email format" in response.json()['detail'][0]["msg"]
