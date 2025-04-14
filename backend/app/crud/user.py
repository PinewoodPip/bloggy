"""
    CRUD methods for Users table.
"""
from sqlalchemy.orm import Session
from models.user import Credentials, User, Editor, Admin
from schemas.user import UserInput, UserUpdate, UserRole, UserOutput, UserLogin, TokenPayload
from core.security import get_password_hash, verify_password, create_access_token
from core.config import CONFIG
from fastapi import HTTPException, status

def create_admin(db: Session, username: str, password: str) -> Admin:
    """
    Creates an admin account.
    """
    user = User()
    credentials = try_create_credentials(db, user)
    credentials.username = username
    credentials.hashed_password = get_password_hash(password)
    db.add(user)

    admin = Admin()
    admin.user = user
    db.add(admin)

    db.commit()
    db.refresh(user)
    db.refresh(admin)
    
    return admin

def create_default_admin(db: Session):
    """
        Creates an admin account with the default credentials, if an account with the default username doesn't exist.
    """
    try:
        admin = get_by_username(db, CONFIG.ADMIN_USERNAME)
    except ValueError as e:
        if "not found" in str(e):
            create_admin(db, CONFIG.ADMIN_USERNAME, CONFIG.ADMIN_PASSWORD)

def create_editor_by_user(db: Session, creator_user: User, user_input: UserInput) -> User:
    """
        Creates an editor account on the behalf of creator_user,
        if they have the privileges to create accounts.
    """
    # Only admins can create accounts
    if not creator_user.admin:
        raise ValueError("Only admins can create editor accounts")
    
    return create_editor(db, user_input)

def create_editor(db: Session, user_input: UserInput) -> User:
    """
    Creates an editor account.
    """
    # Check if username is unique
    existing_user_by_username = db.query(Credentials).filter(Credentials.username == user_input.username).first()
    if existing_user_by_username:
        raise ValueError("An account with that username already exists")

    # Create user
    try:
        user = User()
        credentials = try_create_credentials(db, user)
        credentials.username = user_input.username,
        credentials.hashed_password = get_password_hash(user_input.password),
        db.add(user)

        # Create corresponding editor table entry
        editor = Editor(
            display_name=user_input.display_name,
            contact_email=user_input.contact_email,
            biography=user_input.biography,
        )
        editor.user = user
        db.add(editor)

        db.commit()
        db.refresh(user)
        db.refresh(editor)
    except Exception as e:
        db.rollback()
        raise RuntimeError(str(e))

    return user

def try_create_credentials(db: Session, user: User) -> Credentials:
    """
    Creates a credentials entry for a user account, if it doesn't already have them.
    """
    if not user.credentials:
        credentials = Credentials()
        user.credentials = credentials
        db.add(credentials)
    return user.credentials

def update_user(db: Session, user: User, user_update: UserUpdate) -> User:
    """
        Updates a user's data.
    """
    # Admins do not have the following fields
    if user.admin and (user_update.biography or user_update.contact_email or user_update.display_name):
        raise ValueError("Cannot set editor fields for an admin account")

    # Set fields whose names match the table fields
    update_dict = user_update.model_dump(exclude_unset=True)
    for k,v in update_dict.items():
        setattr(user, k, v)
        if user.editor:
            setattr(user.editor, k, v)
        elif user.admin:
            setattr(user.admin, k, v)

    # Update email, which may be nulled
    if "contact_email" in update_dict and user.editor:
        user.editor.contact_email = update_dict["contact_email"]
    
    # Update username
    if user_update.username and user_update.username != user.credentials.username:
        if not username_is_taken(db, user_update.username):
            user.credentials.username = user_update.username
        else:
            raise ValueError("Username is already taken")
    
    # Update password
    if user_update.password:
        user.credentials.hashed_password = get_password_hash(user_update.password)

    db.commit()
    db.refresh(user)
    db.refresh(user.credentials)

    return user

def get_all(db: Session, roles: set[UserRole]|None) -> list[User]:
    """
    Returns all user accounts, optionally filtered by role.
    """
    users = db.query(User).all()
    valid_users = users

    # Filter by role
    if roles:
        valid_users = []
        for user in users:
            if get_role(user) in roles:
                valid_users.append(user)

    return valid_users

def delete_user(db: Session, user: User):
    """
        Deletes a user account.
    """
    # Ensure the app never loses all admins
    if user.admin and db.query(Admin).count() == 1:
        raise ValueError("Cannot delete the only admin account")

    # TODO first check the user has no articles they are the sole author of, once articles are implemented
    db.delete(user)
    db.commit()

def authenticate(db: Session, login_input: UserLogin) -> tuple[User, str]:
    """
        Creates a JWT token for a user given their credentials.
        Returns the user and their token.
    """
    # Verify credentials
    # The error message is the same for either failure (username or password mismatch)
    # to prevent attackers from knowing if they got either of them right
    try:
        user = get_by_username(db, login_input.username)
    except ValueError as e:
        raise ValueError("Invalid credentials")

    if not user or not verify_password(login_input.password, user.credentials.hashed_password):
        raise ValueError("Invalid credentials")
    
    # Create token and associate it to the user
    token = create_access_token(get_username(user))
    user.current_token = token
    db.commit()
    
    return user, token

def deauthenticate(db: Session, user: User):
    """
        Invalidates a JWT token for a user.
    """
    if user.current_token == None:
        raise ValueError("User has no token")
    user.current_token = None
    db.commit()

def create_user_output(user: User) -> UserOutput:
    """
        Creates a UserOutput response for a user.
    """
    role = get_role(user)

    output = UserOutput(username=get_username(user), role=role)

    # Add editor fields
    if role == UserRole.editor:
        editor = user.editor
        output.contact_email = editor.contact_email
        output.biography = editor.biography
        output.display_name = editor.display_name

    return output

def get_by_username(db: Session, username: str) -> User:
    """
        Returns a user account by their username.
    """
    credentials = db.query(Credentials).filter(Credentials.username == username).first()
    if not credentials:
        raise ValueError("User not found")
    return credentials.user

def username_is_taken(db: Session, username: str) -> bool:
    """
    Returns whether a username is already in use by some account.
    """
    try:
        get_by_username(db, username)
        return True
    except:
        return False

def get_username(user: User) -> str | None:
    """
    Returns the username of an account, if any.
    """
    return user.credentials.username

# Returns an editor by their username
def get_editor(db: Session, username: str) -> Editor | None:
    return get_by_username(db, username).editor

# Get a user's role
def get_role(user: User) -> UserRole:
    if user.editor:
        return UserRole.editor
    elif user.admin:
        return UserRole.admin
    
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User has no role")