"""
    Tests for /users/ API.
"""
from models.user import User
from schemas.user import UserRole, MIN_USERNAME_LENGTH
from utils import create_random_editor, get_session, random_lower_string, random_email, create_random_user_input
from asserts import has_validation_error, is_bad_request, response_detail
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
    for k,v in new_json.items(): # Check all fields match the initial response
        assert v == json[k]

def test_create_editor_duplicate_username():
    # Create a user
    user_input = create_random_user_input()
    response = client.post("/users", json=user_input.model_dump())

    # Ensure first user creation passes
    assert response.status_code == 200

    # Attempt to create another user with same username
    response = client.post("/users", json=user_input.model_dump())
    assert is_bad_request(response, "already exists")

def test_create_user_invalid_username():
    # Try to create a user with a short name
    user_input = create_random_user_input()
    user_input.username = "a" * (MIN_USERNAME_LENGTH - 1) # Right below min length
    response = client.post("/users", json=user_input.model_dump())

    # Expect validation error
    assert has_validation_error(response, "too short")

def test_login_logout():
    """
        Tests login & logout endpoints.
    """
    user, password = create_random_editor(get_session())

    # Login correctly
    response = client.post("/users/login", json={
        "username": user.username,
        "password": password,
    })
    assert response.status_code == 200
    json = response.json()
    assert "token" in json.keys()

    # Logout correctly
    response = client.post("/users/logout", headers={"Authorization": f"Bearer {json["token"]}"})
    assert response.status_code == 200
    assert response.json() == "Logged out successfully"

    # Logout again should warn about token being invalid
    response = client.post("/users/logout", headers={"Authorization": f"Bearer {json["token"]}"})
    assert response.status_code == 401
    assert "Invalid token" in response_detail(response)

def test_wrong_login():
    """
        Tests login endpoint with wrong credentials.
    """
    user, password = create_random_editor(get_session())

    # Login with wrong username
    response = client.post("/users/login", json={
        "username": user.username + "aSuffix",
        "password": password,
    })

    assert response.status_code == 400
    assert "Invalid credentials" in response_detail(response)

    # Login with correct username but wrong password
    response = client.post("/users/login", json={
        "username": user.username,
        "password": password + "aSuffix",
    })
    assert response.status_code == 400
    assert "Invalid credentials" in response_detail(response)
