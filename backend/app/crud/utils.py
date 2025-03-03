from sqlalchemy.orm import Session, InstanceState
from sqlalchemy.inspection import inspect
from pydantic import BaseModel

def patch_entity(obj: object, patch: BaseModel, excluded_fields: set = set()):
    """
    Patches an entity's fields from a pydantic patch model.
    """
    insp: InstanceState = inspect(obj)
    patch_dict = patch.model_dump(exclude_unset=True) # Ignore unset fields; these are interpreted as "do not patch this field". An explicit None is used to null fields.
    for k,v in patch_dict.items():
        # Set attributes
        if insp.attrs.has_key(k) and k not in excluded_fields:
            setattr(obj, k, v)
