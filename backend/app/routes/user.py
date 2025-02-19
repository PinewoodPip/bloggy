from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.config import get_db
from schemas.user import UserInput, UserOutput, UserLogin, UserLoginOutput, UserUpdate
from core.utils import get_current_user, get_current_user_optional
from models.user import User
import crud.user as UserCrud

router = APIRouter()

@router.post("/login", response_model=UserLoginOutput)
async def login(login_input: UserLogin, db: Session=Depends(get_db)):
    """
        Authenticates a user and generates a JWT token for them.
    """
    try:
        user, token = UserCrud.authenticate(db, login_input)
        return UserLoginOutput(token=token, **UserCrud.create_user_output(user).model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/logout", response_model=str)
async def logout(db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    """
        Invalidates a JWT token for a user.
    """
    try:
        UserCrud.deauthenticate(db, current_user)
    except Exception as e: # Should never occur, as the endpoint has get_current_user as dependency.
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return "Logged out successfully"

@router.post("/", response_model=UserOutput)
async def add_user(user_input: UserInput, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    try:
        user = UserCrud.create_editor_by_user(db, current_user, user_input)
    except ValueError as e:
        msg = str(e)
        if "Only admins can create" in msg: # Lack of privilege uses 401 code
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=msg)
        else: # Other errors are bad requests
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    return UserCrud.create_user_output(user)

@router.get("/{username}", response_model=UserOutput)
async def get_user_by_username(username: str, db: Session=Depends(get_db), current_user: User=Depends(get_current_user_optional)):
    """
        Returns a user's data by their username.
    """
    try:
        user = UserCrud.get_by_username(db, username)

        # Only staff accounts can query admin account information,
        # so attackers cannot stumble upon them.
        if user.admin and not current_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    except ValueError as e:
        msg = str(e)
        if "not found" in msg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return UserCrud.create_user_output(user)

@router.patch("/", response_model=UserOutput)
async def update_user(user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        user = UserCrud.update_user(db, current_user, user_update)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return UserCrud.create_user_output(user)

@router.delete("/{username}", response_model=str)
async def update_user(username: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
        Deletes a user account.
        The auth user must be an admin.
        Fails if the account to be deleted is the last remaining admin account.
    """
    if not current_user.admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Only admins can delete accounts")
    
    try:
        user = UserCrud.get_by_username(db, username)
        UserCrud.delete_user(db, user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
    return "Account deleted successfully"

# TODO
# @router.delete("/user", status_code=status.HTTP_200_OK)
# async def delete_user(
#     db: Session = Depends(get_db),
#     current_user: user_model.User = Depends(get_current_user)
# ):
    
#     respose = delete_user_account_crud(db, current_user)
#     return respose
