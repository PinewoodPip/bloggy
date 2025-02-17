"""
    Security-related methods: auth, hashing passwords
"""
from datetime import datetime, timedelta
from typing import Annotated
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import ValidationError
from pytest import Session
from core.config import get_db
from fastapi import Depends, HTTPException, status
from models.user import User
from schemas.user import TokenPayload
from dotenv import load_dotenv
import os
from jose import jwt, JWTError, ExpiredSignatureError
from passlib.context import CryptContext

# Load environment variables from .env file
load_dotenv()

# Data from .env file
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
EXPIRE_DELTA = timedelta(days=int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS")))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
