import re
from typing import Optional
from pydantic import BaseModel, field_validator
from schemas.user import UserOutput

PATH_PATTERN = re.compile(r"^\/[a-zA-z0-9\/]+\.[\w]+$", re.A) # Allows alphanumeric + underscore and slashes; must end with an extension

class FileInput(BaseModel):
    """
    Schema for creating files.
    """
    path: str
    content: str # Base64-encoded.

    @field_validator("path", check_fields=False)
    def validate_url(cls, path: str):
        if len(path) == 0 or path[0] != "/":
            raise ValueError("Paths must start with a slash")
        if not PATH_PATTERN.match(path): # Cannot contain characters that are reserved or would require url-encoding
            raise ValueError("Invalid path")
        return path
    
class FilePreview(BaseModel):
    """
    Schema for file metadata, without content.
    """
    path: str
    filename: str
    uploader: UserOutput

class FileOutput(FilePreview):
    """
    Schema for reading files.
    """
    content: str

class FileTreeOutput(BaseModel):
    """
    Schema for a file tree.
    """
    folder_name: str # Folder name
    path: str
    files: list[FilePreview]
    subfolders: dict[str, "FileTreeOutput"]

class FileUpdate(BaseModel):
    """
    Schema for updating files.
    """
    path: Optional[str] = None
    content: Optional[str] = None # Base64-encoded.
