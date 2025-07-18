from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from core.config import get_db
from core.utils import get_current_user, get_current_user_optional
from models.user import User
import schemas.file as FileSchemas
import crud.file as FileCrud

router = APIRouter()

@router.post("/", response_model=FileSchemas.FileOutput)
async def upload_file(file_input: FileSchemas.FileInput, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    """
    Uploads a file.
    """
    try:
        file = FileCrud.create_file(db, current_user, file_input)
        return FileCrud.create_file_output(db, file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=FileSchemas.FileTreeOutput)
async def get_all(db: Session=Depends(get_db), current_user: User=Depends(get_current_user_optional)):
    """
    Gets all files as a tree structure.
    """
    try:
        return FileCrud.get_tree_output(db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{file_path:path}/metadata", response_model=FileSchemas.FileOutput)
async def get_file_metadata(file_path: str, db: Session=Depends(get_db)):
    """
    Fetches a file's metadata by its path.
    """
    try:
        file = FileCrud.get_by_path(db, "/" + file_path)
        if not file:
            raise HTTPException(status_code=404)
        return FileCrud.create_file_output(db, file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{file_path:path}",
    response_class=Response, # Necessary for Swagger to not show an an extra "application/json" return type
    responses = {
        200: {
            "content": {"image/png": {}}
        }
    }
)
async def get_file(file_path: str, db: Session=Depends(get_db)):
    """
    Fetches a file's content by its path.
    """
    try:
        file = FileCrud.get_by_path(db, "/" + file_path)
        if not file:
            raise HTTPException(status_code=404)
        extension = file.path.split(".")[-1].lower()
        response = Response(content=file.content, media_type=f"image/{extension}", status_code=200)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{file_path:path}", response_model=FileSchemas.FileOutput)
async def patch_file(file_path: str, file_update: FileSchemas.FileUpdate, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    """
    Updates a file's content or metadata.
    """
    try:
        file = FileCrud.get_by_path(db, "/" + file_path)
        if not file:
            raise HTTPException(status_code=404)
        file = FileCrud.update_file(db, file, file_update)
        return FileCrud.create_file_output(db, file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.put("/{file_path:path}", response_model=FileSchemas.FileOutput)
async def put_file(file_path: str, file_input: FileSchemas.FileInput, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    """
    Uploads or replaces a file.
    """
    try:
        file = FileCrud.get_by_path(db, "/" + file_path)
        if file:
            file = FileCrud.update_file(db, file, FileSchemas.FileUpdate(path=file_input.path, content=file_input.content))
        else:
            file = FileCrud.create_file(db, current_user, file_input)
        return FileCrud.create_file_output(db, file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{file_path:path}")
async def delete_file(file_path: str, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    """
    Deletes a file.
    """
    try:
        file = FileCrud.get_by_path(db, "/" + file_path)
        if not file:
            raise HTTPException(status_code=404)
        file = FileCrud.delete_file(db, file)
        return "File deleted"
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
