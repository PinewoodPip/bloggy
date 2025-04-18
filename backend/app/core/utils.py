"""
    App-wide utility methods.
"""
from elasticsearch import Elasticsearch
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError
from schemas.user import TokenPayload
from pydantic import ValidationError
from sqlalchemy.orm import Session
from core.security import get_HTTPBearer, get_optional_HTTPBearer, decode_google_jwt_token
from core.config import CONFIG, get_db
from crud.user import User, get_by_username

def get_current_user(db: Session=Depends(get_db), credentials: HTTPAuthorizationCredentials=Depends(get_HTTPBearer)) -> User:
    """
    Returns the user associated to a JWT token.
    Credits to Diego Hernandez.
    """
    token = credentials.credentials
    is_oauth = False
    try:
        payload = jwt.decode(token, CONFIG.SECRET_KEY, algorithms=[CONFIG.ALGORITHM])
        token_data = TokenPayload(**payload)
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token expired") 
    except (JWTError, ValidationError) as e:
        try:
            payload = decode_google_jwt_token(token)
            token_data = TokenPayload(**payload)
            is_oauth = True
        except:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials")

    # Fetch user
    try:
        user = get_by_username(db, token_data.sub)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    # Ensure the token matches the current one in the DB
    # The consequence of this is that only 1 session is allowed per user at a time (ie. logging on one device logs you out on others). TODO?
    if user.current_token != token and not is_oauth:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    return user

def get_current_user_optional(db: Session=Depends(get_db), credentials: HTTPAuthorizationCredentials=Depends(get_optional_HTTPBearer)) -> User:
    """
        Returns the user associated with a token, if any was provided.
        Use for endpoints that admit auth for extra functionality, but don't require it.
    """
    if not credentials:
        return None
    return get_current_user(db, credentials)

def get_elastic_search():
    if CONFIG.ES_ENABLED:
        es = Elasticsearch([CONFIG.ES_URL], basic_auth=(CONFIG.ES_USERNAME, CONFIG.ES_PASSWORD))
        try:
            yield es
        finally:
            es.close()
    else:
        yield None
