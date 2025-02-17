"""
    Security-related methods: auth, hashing passwords
"""
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from schemas.user import TokenPayload, UserLogin
from pydantic import ValidationError
from sqlalchemy.orm import Session
from core.config import get_db
from models.user import User
from core.config import CONFIG
from passlib.context import CryptContext
from datetime import datetime, timedelta
import crud.user as UserCrud

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
get_HTTPBearer = HTTPBearer()

def authenticate(db: Session, login_input: UserLogin) -> tuple[User, str]:
    """
        Creates a JWT token for a user given their credentials.
        Returns the user and their token.
    """
    user = UserCrud.get_by_username(db, login_input.username)

    # Verify credentials
    # The error message is the same for either failure (username or password mismatch)
    # to prevent attackers from knowing if they got either of them right
    if not user or not verify_password(login_input.password, user.hashed_password):
        raise ValueError("Invalid credentials")
    
    # Create token and associate it to the user
    token = create_access_token(user.username)
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

def get_current_user(db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(get_HTTPBearer)) -> User:
    """
        Returns the user associated to a JWT token.
        Credits to Diego Hernandez.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, CONFIG.SECRET_KEY, algorithms=[CONFIG.ALGORITHM])
        token_data = TokenPayload(**payload)
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token expired") 
    except (JWTError, ValidationError) as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials")

    user = db.get(User, token_data.sub)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    # Ensure the token matches the current one in the DB
    # The consequence of this is that only 1 session is allowed per user at a time (ie. logging on one device logs you out on others). TODO?
    if user.current_token != token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    return user

def create_access_token(subject: str, expires_delta: timedelta=None) -> str:
    """
        Creates a JWT token.
        Credits to Diego Hernandez.
    """
    expire = datetime.now(timezone.utc) + (expires_delta if expires_delta else timedelta(days=CONFIG.ACCESS_TOKEN_EXPIRE_DAYS))
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, CONFIG.SECRET_KEY, algorithm=CONFIG.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
