"""
    Tests for /categories/ API.
"""
import random
from fastapi.testclient import TestClient
from utils import create_random_file_content
from main import app
from schemas.file import *
from asserts import *
from fixtures import *
import base64

client = TestClient(app)

def test_create_file(user_scenario):
    """
    Tests creating files.
    """
    content_bytes, content_str = create_random_file_content()
    file_input = FileInput(
        path="/somefolder/somefile.bin",
        content=content_str,
    )
    response = client.post("/files", headers=user_scenario.editor_token_header, json=file_input.model_dump())

    assert is_ok_response(response)

    file_output = FileOutput.model_validate(response.json())
    assert file_output.uploader.username == user_scenario.editor.username
    assert file_output.content == content_str
    assert file_output.path == file_input.path

def test_create_file_invalid_path(file_scenario):
    """
    Tests creating files with invalid paths.
    """
    # Create files with invalid path strings
    content_bytes, content_str = create_random_file_content()
    response = client.post("/files", headers=file_scenario.editor_token_header, json={
        "path": "no_leading_slash/somefile.bin",
        "content": content_str,
    })

    assert has_validation_error(response, "start with a slash")

    response = client.post("/files", headers=file_scenario.editor_token_header, json={
        "path": "/asdasd[/]/dsd",
        "content": content_str,
    })

    assert has_validation_error(response, "Invalid path")

    # Attempt to create a file whose path conflicts with an existing one
    existing_file = file_scenario.files[0]
    file_input = FileInput(
        path=existing_file.path,
        content=content_str,
    )
    response = client.post("/files", headers=file_scenario.editor_token_header, json=file_input.model_dump())
    assert is_bad_request(response, "already exists")

def test_patch_file(file_scenario):
    """
    Tests patching file data.
    """
    # Patch file content
    file = file_scenario.files[0]
    new_content_bytes, new_content_str = create_random_file_content()
    response = client.patch(f"/files/{file.path[1:]}", headers=file_scenario.editor_token_header, json={
        "content": new_content_str,
    })
    assert is_ok_response(response)

    # Retrieve it
    response = client.get(f"/files/{file.path[1:]}", headers=file_scenario.editor_token_header)
    assert is_ok_response(response)
    file_output = FileOutput.model_validate(response.json())
    assert file_output.content == new_content_str

    # Patch file path
    file = file_scenario.files[1]
    new_path = "/new/path/item.bin"
    response = client.patch(f"/files/{file.path[1:]}", headers=file_scenario.editor_token_header, json={
        "path": new_path,
    })
    assert is_ok_response(response)

    # Retrieve from new path
    response = client.get(f"/files/{new_path[1:]}", headers=file_scenario.editor_token_header)
    assert is_ok_response(response)
    file_output = FileOutput.model_validate(response.json())
    assert file_output.path == new_path
    assert file_output.content == file.content

    # Expect 404 from previous path
    response = client.get(f"/files/{file.path[1:]}", headers=file_scenario.editor_token_header)
    assert is_not_found(response)
