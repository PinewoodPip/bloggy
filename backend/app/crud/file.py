"""
CRUD methods for Files table.
"""
from sqlalchemy.orm import Session
import crud.utils as CrudUtils
from crud.user import create_user_output
from models.user import User
from models.file import *
from schemas.file import *
from collections import defaultdict
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

def create_file_preview(db: Session, file: File) -> FilePreview:
    """
    Creates a FilePreview response for a file.
    """
    return CrudUtils.create_schema(file, FilePreview, {
        "filename": get_filename(file),
        "uploader": create_user_output(file.uploader),
    })

def create_file_output(db: Session, file: File) -> FileOutput:
    """
    Creates a FileOutput response for a file.
    """
    return CrudUtils.create_schema(file, FileOutput, {
        "filename": get_filename(file),
        "content": base64.b64encode(file.content).decode("ascii"),
        "uploader": create_user_output(file.uploader),
    })

def get_by_path(db: Session, path: str) -> User:
    """
    Returns a file by its path.
    """
    return db.query(File).filter(File.path == path).first()

def get_filename(file: File) -> str:
    """
    Returns the filename (with extension) of a file.
    """
    return file.path.split("/")[-1]

def decode_content(encoded_content: str) -> bytes:
    """
    Decodes base64-encoded bytes.
    """
    return base64.b64decode(encoded_content)

def _get_file_tree_dict(paths: dict[str, File]) -> dict:
    """
    Returns a dict that maps files to a directory-like nested map.
    Source: https://stackoverflow.com/a/58917078
    """
    new_path_dict = CrudUtils.nested_dict()
    for path, file in paths.items():
        parts = path.split('/') # Split by folder
        if parts:
            # Find the deepest folder for the file
            marcher = new_path_dict 
            for key in parts[:-1]:
               marcher = marcher[key] # Create folder for the component
            marcher[parts[-1]] = file # Map the file
            
    return CrudUtils.default_to_regular(new_path_dict)

def build_tree_output(db: Session, current: FileTreeOutput, d: dict) -> FileTreeOutput:
    for key, item in d.items():
        if type(item) == dict:
            subfolder = FileTreeOutput(folder_name=key, files=[], subfolders={})
            subfolder = build_tree_output(db, subfolder, item)
            current.subfolders[key] = subfolder
        else:
            current.files.append(create_file_preview(db, item))
    return current

def get_tree_output(db: Session) -> FileTreeOutput:
    """
    Returns all files in a tree structure schema.
    """
    files = get_all(db)
    paths_dict = {file.path: file for file in files}
    processed = _get_file_tree_dict(paths_dict)

    new_dict = FileTreeOutput(folder_name="/", files=[], subfolders={})
    build_tree_output(db, new_dict, processed[""]) # Start from "/""

    return new_dict