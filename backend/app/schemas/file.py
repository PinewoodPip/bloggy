import re
from typing import Optional
from pydantic import BaseModel, field_validator
from schemas.user import UserOutput

PATH_PATTERN = re.compile(r"^\/[a-zA-z0-9\/]+\.[\w]+$", re.A) # Allows alphanumeric + underscore and slashes; must end with an extension
    
class FileData(BaseModel):
    """
    Base file schema.
    """
    path: str
    content: str # Base64-encoded.

class FileInput(FileData):
    """
    Schema for creating files.
    """

    @field_validator("path", check_fields=False)
    def validate_url(cls, path: str):
        if len(path) == 0 or path[0] != "/":
            raise ValueError("Paths must start with a slash")
        if not PATH_PATTERN.match(path): # Cannot contain characters that are reserved or would require url-encoding
            raise ValueError("Invalid path")
        return path

class FileOutput(FileData):
    """
    Schema for reading files.
    """
    uploader: UserOutput

class FileUpdate(FileData):
    """
    Schema for updating files.
    """
    path: Optional[str] = None
    content: Optional[str] = None # Base64-encoded.
