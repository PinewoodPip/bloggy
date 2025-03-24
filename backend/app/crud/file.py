"""
CRUD methods for Files table.
"""
from sqlalchemy.orm import Session
import crud.utils as CrudUtils
from crud.user import create_user_output
from models.user import User
from models.file import *
from schemas.file import *
import base64

PATCH_FILE_EXCLUDED_FIELDS = set(["id", "content"])

def create_file(db: Session, uploader: User, file_input: FileInput) -> File:
    """
    Creates a file entry.
    """
    if get_by_path(db, file_input.path):
        raise ValueError("A file already exists at that path")

    file = File(
        path=file_input.path,
        content=decode_content(file_input.content),
    )
    file.uploader = uploader
    db.add(file)

    db.commit()
    db.refresh(file)
    
    return file

def update_file(db: Session, file: File, file_update: FileUpdate) -> File:
    """
    Updates a file's data.
    """
    # Check new path is unused, if being changed
    if file_update.path:
        file_under_new_path = get_by_path(db, file_update.path)
        if file_under_new_path and file_under_new_path != file:
            raise ValueError("A file already exists at that path")

    CrudUtils.patch_entity(file, file_update, PATCH_FILE_EXCLUDED_FIELDS)

    # Update content
    if file_update.content:
        file.content = decode_content(file_update.content)

    db.commit()
    db.refresh(file)
    return file

def get_all(db: Session) -> list[File]:
    """
    Returns all files.
    """
    files = db.query(File).all()
    return files

def delete_file(db: Session, file: File):
    """
    Deletes a file.
    """
    db.delete(file)
    db.commit()

def create_file_output(db: Session, file: File) -> FileOutput:
    """
    Creates a FileOutput response for a file.
    """
    return CrudUtils.create_schema(file, FileOutput, {
        "content": base64.b64encode(file.content).decode("ascii"),
        "uploader": create_user_output(file.uploader),
    })

def get_by_path(db: Session, path: str) -> User:
    """
    Returns a file by its path.
    """
    return db.query(File).filter(File.path == path).first()

def decode_content(encoded_content: str) -> bytes:
    """
    Decodes base64-encoded bytes.
    """
    return base64.b64decode(encoded_content)