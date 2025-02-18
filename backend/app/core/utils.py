"""
    App-wide utility methods.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError
from schemas.user import TokenPayload
from pydantic import ValidationError
from sqlalchemy.orm import Session
from core.security import get_HTTPBearer, get_HTTPBearer
from core.config import CONFIG, get_db
from crud.user import User

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