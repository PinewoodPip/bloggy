"""
    CRUD methods for Users table.
"""
from sqlalchemy.orm import Session
from models.user import User, Editor, Admin
from schemas.user import UserInput, UserUpdate, UserRole, UserOutput
from core.security import get_password_hash, verify_password
from core.config import CONFIG
from fastapi import HTTPException, status

def create_editor(db: Session, username: str, user_input: UserInput) -> Editor:
    editor = Editor(
        username=username,
        display_name=user_input.display_name,
        contact_email=user_input.contact_email,
        biography=user_input.biography,
    )
    db.add(editor)
    return editor

def create_admin(db: Session, username: str) -> Admin:
    admin = Admin(
        username=username,
    )
    db.add(admin)
    return admin

def create_default_admin(db: Session) -> Admin:
    admin_exists = get_by_username(db, CONFIG.ADMIN_USERNAME) != None
    if not admin_exists:
        user = User(
            username=CONFIG.ADMIN_USERNAME,
            hashed_password=get_password_hash(CONFIG.ADMIN_PASSWORD),
        )
        db.add(user)
        admin = create_admin(db, CONFIG.ADMIN_USERNAME)
        db.commit()
        db.refresh(user)
        db.refresh(admin)

def create_user(db: Session, user_input: UserInput) -> User:
    # Check if username is unique
    existing_user_by_username = db.query(User).filter(User.username == user_input.username).first()
    if existing_user_by_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with that username already exists") # TODO don't raise HTTPExceptions in crud

    # Create user
    try:
        user = User(
            username=user_input.username,
            hashed_password=get_password_hash(user_input.password),
        )
        db.add(user)

        # Create corresponding editor table entry
        editor = create_editor(db, user.username, user_input)

        db.commit()
        db.refresh(user)
        db.refresh(editor)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e)

    return user

def create_user_output(user: User) -> UserOutput:
    """
        Creates a UserOutput response for a user.
    """
    role = get_role(user)

    output = UserOutput(username=user.username, role=role)

    # Add editor fields
    if role == UserRole.editor:
        editor = user.editor
        output.contact_email = editor.contact_email
        output.biography = editor.biography
        output.display_name = editor.display_name

    return output

# Get user by username
def get_by_username(db: Session, username: str) -> User|None:
    user = db.query(User).filter(User.username == username).first()
    return user

# Returns an editor by their username
def get_editor(db: Session, username: str) -> Editor|None:
    return db.query(Editor).filter(Editor.username == username).first()

# Get a user's role
def get_role(user: User) -> UserRole:
    if user.editor:
        return UserRole.editor
    elif user.admin:
        return UserRole.admin
    
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User has no role")