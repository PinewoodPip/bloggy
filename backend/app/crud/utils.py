from sqlalchemy.orm import Session, InstanceState
from sqlalchemy.inspection import inspect
from pydantic import BaseModel
from typing import TypeVar

T = TypeVar("T")

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

def create_schema(obj: object, schema: BaseModel | T, extra_fields: dict[str, any] = dict()) -> T:
    """
    Creates a schema out of an SQLAlchemy entity proxy.
    """
    schema_dict = {}
    for key, field in schema.model_fields.items():
        if key in extra_fields:
            value = extra_fields[key]
        else: # Fetch value from ORM model
            value = getattr(obj, key)
        schema_dict[key] = value

    return schema.model_validate(schema_dict)

def concatenate_path(*components: str) -> str:
    """
    Concatenates path elements into a slash-delimited path.
    """
    path = "/".join(components)
    if path.startswith("//"): # Will occur if first component is root ("/")
        path = path[1:]
    return path
