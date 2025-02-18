"""
    Security-related methods: auth, hashing passwords
"""
from fastapi.security import HTTPBearer
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from schemas.user import TokenPayload, UserLogin
from sqlalchemy.orm import Session
from core.config import get_db
from core.config import CONFIG
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
get_HTTPBearer = HTTPBearer()
get_optional_HTTPBearer = HTTPBearer(auto_error=False) # For endpoints that admit auth for extra functionality, but don't require it.

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
