from pydantic import BaseModel
from models.category import *

class CategoryPreview(BaseModel):
    id: int
    name: str
    description: str
    directory_name: str
    view_type: CategoryViewEnum
    sorting_type: CategorySortingModeEnum