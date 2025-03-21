"""
    Utility methods for common asserts, mainly for HTTP responses.
"""
from httpx import Response

def response_detail(response: Response) -> str|dict:
    """
    Returns the detail message/object of a response.
    """
    return response.json()["detail"]

def is_bad_request(response: Response, msg: str) -> bool:
    """
    Returns whether the request was badly formatted for a specific reason.
    """
    return response.status_code == 400 and msg in response_detail(response)

def is_not_found(response: Response) -> bool:
    return response.status_code == 404

def is_unauthorized_request(response: Response, msg: str) -> bool:
    """
    Returns whether the request failed due to lack of privileges.
    """
    return response.status_code == 401 and msg in response_detail(response)

def has_validation_error(response: Response, msg: str) -> bool:
    """
    Returns whether the request failed field validation for a specific reason.
    """
    return response.status_code == 422 and msg in response_detail(response)[0]["msg"]

def is_ok_response(response: Response):
    """
    Returns whether the response was of the 200 status code,
    and logs the response if it wasn't.
    """
    if response.status_code != 200:
        print(response.json())
    return response.status_code == 200
