from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.config import get_db
from schemas.user import UserInput, UserOutput, UserLogin, UserLoginOutput
from core.security import get_current_user, authenticate, deauthenticate
from models.user import User
import crud.user as UserCrud

router = APIRouter()

@router.post("/login", response_model=UserLoginOutput)
async def login(login_input: UserLogin, db: Session=Depends(get_db)):
    """
        Authenticates a user and generates a JWT token for them.
    """
    try:
        user, token = authenticate(db, login_input)
        return UserLoginOutput(token=token, **UserCrud.create_user_output(user).model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/logout", response_model=str)
async def logout(db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    """
        Invalidates a JWT token for a user.
    """
    try:
        deauthenticate(db, current_user)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return "Logged out successfully"

@router.post("/", response_model=UserOutput)
async def add_user(user_input: UserInput, db: Session=Depends(get_db)):
    user = UserCrud.create_user(db, user_input)
    return UserCrud.create_user_output(user)

@router.get("/{username}", response_model=UserOutput)
async def get_user_by_username(username: str, db: Session=Depends(get_db)):
    user = UserCrud.get_by_username(db, username)
    return UserCrud.create_user_output(user)

# TODO
# @router.put("/user", response_model=UserOutput)
# async def update_user(
#     user_update: user_model.UserUpdate,
#     db: Session = Depends(get_db),
#     current_user: user_model.User = Depends(get_current_user)
# ):
#     user = update_user_crud(db, current_user, user_update)
#     return user_model.UserOutput.model_validate(user)

# TODO
# @router.delete("/user", status_code=status.HTTP_200_OK)
# async def delete_user(
#     db: Session = Depends(get_db),
#     current_user: user_model.User = Depends(get_current_user)
# ):
    
#     respose = delete_user_account_crud(db, current_user)
#     return respose
