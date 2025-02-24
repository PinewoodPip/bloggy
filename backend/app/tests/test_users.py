"""
    Tests for /users/ API.
"""
from models.user import User
from schemas.user import UserRole, MIN_USERNAME_LENGTH
from utils import create_random_auth_editor, create_random_editor, create_random_admin, get_session, get_token_header, random_lower_string, random_email, create_random_user_input, random_password
from asserts import has_validation_error, is_bad_request, is_not_found, is_unauthorized_request, response_detail
from fastapi.testclient import TestClient
from core.config import get_db, engine
from main import app
from sqlalchemy.schema import MetaData
from core.config import Base

client = TestClient(app)

def test_create_editor():
    admin = create_random_admin(get_session())
    header = get_token_header(admin.token)

    # Create the user
    user_input = create_random_user_input()

    response = client.post("/users", headers=header, json=user_input.model_dump())

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
    admin = create_random_admin(get_session())
    header = get_token_header(admin.token)

    # Create a user
    user_input = create_random_user_input()
    response = client.post("/users", headers=header, json=user_input.model_dump())

    # Ensure first user creation passes
    assert response.status_code == 200

    # Attempt to create another user with same username
    response = client.post("/users", headers=header, json=user_input.model_dump())
    assert is_bad_request(response, "already exists")

def test_create_user_invalid_credentials():
    """
        Tests creating an account with invalid username or password.
    """
    admin = create_random_admin(get_session())
    header = get_token_header(admin.token)

    # Try to create a user with a short name
    user_input = create_random_user_input()
    user_input.username = "a" * (MIN_USERNAME_LENGTH - 1) # Right below min length
    response = client.post("/users", headers=header, json=user_input.model_dump())
    assert has_validation_error(response, "too short")

    # Try to create a user with a password with only alpha-numeric characters
    user_input = create_random_user_input()
    user_input.password = "onlyalphanumeric123"
    response = client.post("/users", headers=header, json=user_input.model_dump())
    assert has_validation_error(response, "must have 1+ non-alpha-numeric")

    # Try to create a user with a password with no digit characters
    user_input = create_random_user_input()
    user_input.password = "onlyletters#"
    response = client.post("/users", headers=header, json=user_input.model_dump())
    assert has_validation_error(response, "must have 1+ digit characters")

def test_login_logout():
    """
        Tests login & logout endpoints.
    """
    user = create_random_editor(get_session())

    # Login correctly
    response = client.post("/users/login", json={
        "username": user.username,
        "password": user.password,
    })
    assert response.status_code == 200
    json = response.json()
    assert "token" in json.keys()

    # Logout correctly
    response = client.post("/users/logout", headers=get_token_header(json["token"]))
    assert response.status_code == 200
    assert response.json() == "Logged out successfully"

    # Logout again should warn about token being invalid
    response = client.post("/users/logout", headers=get_token_header(json["token"]))
    assert response.status_code == 401
    assert "Invalid token" in response_detail(response)

def test_wrong_login():
    """
        Tests login endpoint with wrong credentials.
    """
    user = create_random_editor(get_session())

    # Login with wrong username
    response = client.post("/users/login", json={
        "username": user.username + "aSuffix",
        "password": user.password,
    })

    assert response.status_code == 400
    assert "Invalid credentials" in response_detail(response)

    # Login with correct username but wrong password
    response = client.post("/users/login", json={
        "username": user.username,
        "password": user.password + "aSuffix",
    })
    assert response.status_code == 400
    assert "Invalid credentials" in response_detail(response)

def test_get_nonexistent_user():
    """
        Tests fetching data of an account that doesn't exist.
    """
    USERNAME = "aaa" # Too short to correspond to any user

    response = client.get(f"/users/{USERNAME}")
    assert is_not_found(response)

def test_patch_user():
    """
        Tests patching user data.
    """
    user = create_random_auth_editor(get_session())
    header = get_token_header(user.token)

    # Edit biography and display name
    new_data = {
        "biography": "new bio",
        "display_name": "new displayname",
    }
    old_contact_email = user.contact_email # Keep email intact
    response = client.patch("/users/" + user.username, headers=header, json=new_data)

    # Ensure fields changed accordingly
    assert response.status_code == 200
    json = response.json()
    for k,v in new_data.items():
        assert json[k] == v
    assert json["contact_email"] == old_contact_email # Ensure unmodified email field hasn't changed

    # Unset contact email
    new_data = {
        "contact_email": None,
    }
    old_contact_email = user.contact_email # Keep email intact
    response = client.patch("/users/" + user.username, headers=header, json=new_data)
    json = response.json()
    assert response.status_code == 200
    assert json["contact_email"] == None

    # Change password and username
    new_data = {
        "username": random_lower_string(),
        "password": random_password(),
    }
    response = client.patch("/users/" + user.username, headers=header, json=new_data)
    assert response.status_code == 200
    assert response.json()["username"] == new_data["username"]

    # Logout and log back in
    response = client.post("/users/logout", headers=header)

    # Ensure previous credentials are no longer valid
    response = client.post("/users/login", json={
        "username": user.username,
        "password": user.password, # Old password
    })
    assert is_bad_request(response, "Invalid credentials")

    response = client.post("/users/login", json={
        "username": new_data["username"],
        "password": new_data["password"],
    })
    assert response.status_code == 200

    # Ensure non-admin users cannot patch each other
    other_user = create_random_auth_editor(get_session())
    other_user_header = get_token_header(other_user.token)
    response = client.patch("/users/" + new_data["username"], headers=other_user_header, json=new_data)
    assert is_unauthorized_request(response, "Only admins can edit")

    # Check admins can edit anyone's account
    admin_user = create_random_admin(get_session())
    admin_user_header = get_token_header(admin_user.token)
    response = client.patch("/users/" + new_data["username"], headers=admin_user_header, json=new_data)
    assert response.status_code == 200

def test_patch_wrong_fields():
    """
        Tests trying to patch fields that an account type doesn't support.
    """
    user = create_random_admin(get_session())
    header = get_token_header(user.token)

    # Edit biography and display name, which admins don't have
    new_data = {
        "biography": "new bio",
        "display_name": "new displayname",
    }
    response = client.patch("/users/" + user.username, headers=header, json=new_data)
    assert is_bad_request(response, "Cannot set editor fields")

def test_query_admin_as_guest():
    """
        Tests trying to get information of an admin account with no auth provided.
    """
    admin = create_random_admin(get_session())

    # Expect no resource found
    response = client.get(f"/users/{admin.username}")
    assert response.status_code == 404

def test_delete_user():
    """
        Tests deleting user accounts.
    """
    db = get_session()
    admin, editor = create_random_admin(db), create_random_auth_editor(db)
    admin_header, editor_header = get_token_header(admin.token), get_token_header(editor.token)

    # Editors cannot delete accounts
    response = client.delete(f"/users/{editor.username}", headers=editor_header)
    assert is_unauthorized_request(response, "Only admins can delete accounts")

    # Admins can delete editor accounts
    response = client.delete(f"/users/{editor.username}", headers=admin_header)
    assert response.status_code == 200

    # Admins can delete their own account
    response = client.delete(f"/users/{admin.username}", headers=admin_header)
    assert response.status_code == 200

def test_get_all_users():
    """
    Tests fetching all users.
    """
    db = get_session()
    admin, editor = create_random_admin(db), create_random_auth_editor(db)
    admin_header, editor_header = get_token_header(admin.token), get_token_header(editor.token)
    
    # GET as admin
    response = client.get(f"/users/", headers=admin_header)
    json = response.json()
    assert response.status_code == 200

    # Check both accounts are in response
    has_admin, has_editor = False, False
    for user in json:
        if user["username"] == admin.username:
            has_admin = True
        if user["username"] == editor.username:
            has_editor = True
    assert has_admin and has_editor

    # GET as editor
    response = client.get(f"/users/", headers=editor_header)
    json = response.json()
    assert response.status_code == 200

    # Check only editor account is in response
    has_admin, has_editor = False, False
    for user in json:
        if user["username"] == admin.username:
            has_admin = True
        if user["username"] == editor.username:
            has_editor = True
    assert not has_admin and has_editor
