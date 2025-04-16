from typing import Optional
from pydantic import BaseModel, field_validator
import enum
import re

MIN_USERNAME_LENGTH = 8 # In characters.
MIN_PASSWORD_LENGTH = 8 # In characters.
DIGIT_PATTERN = re.compile(r".*\d.*") # Matches whole string if there is any digit.

# Account role enum
class UserRole(enum.Enum):
    admin = "admin"
    editor = "editor"

# Input user for login
class UserLogin(BaseModel):
    username: str
    password: str

    @field_validator("username", check_fields=False)
    def validate_username(cls, v: str):
        # Min length check
        if len(v) < MIN_USERNAME_LENGTH:
            raise ValueError(f"Username is too short; must be at least {MIN_USERNAME_LENGTH} characters")
        return v

    @field_validator("password", check_fields=False)
    def validate_password(cls, v: str):
        # Min length check
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password is too short; must be at least {MIN_PASSWORD_LENGTH} characters")
        if v.isalnum():
            raise ValueError("Password must have 1+ non-alpha-numeric character")
        if not DIGIT_PATTERN.search(v):
            raise ValueError("Password must have 1+ digit characters")
        return v

# JSON payload containing access token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str = None

# Contents of JWT token
class TokenPayload(BaseModel):
    exp: int
    sub: str

# Registration schema
# No role selection for now; all accounts created via API can only be editors
class UserInput(UserLogin):
    display_name: str
    contact_email: Optional[str] = None
    biography: Optional[str] = None

    @field_validator("contact_email", check_fields=False)
    def validate_email(cls, v):
        # Credits to Diego Hernandez for the pattern
        # TODO relax pattern, since emails have much more lax format (though uncommon for them to be very short / have multiple dots)
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email format")
        return v

# TODO split into 2 schemas?
class UserOutput(BaseModel):
    username: str
    role: UserRole

    # Following fields are only present for editors
    display_name: Optional[str] = None
    contact_email: Optional[str] = None
    biography: Optional[str] = None
    avatar_file_path: Optional[str] = None

class UserLoginOutput(UserOutput):
    token: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    biography: Optional[str] = None
    contact_email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_file_path: Optional[str] = None
