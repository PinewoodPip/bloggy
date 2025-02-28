from pydantic import BaseModel
from models.category import *

class CategoryDef(BaseModel):
    id: int
    name: str
    url: str
    view_type: CategoryViewEnum
    sorting_type: CategorySortingModeEnum