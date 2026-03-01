"""Dependency to retrieve and validate an API cookie (JWT token)."""

from fastapi import Security
from fastapi.security.api_key import APIKeyCookie

from app.core.exceptions import UnauthorizedError
from app.security import auth_session_manager

# Define the cookie key for FastAPI to look for
api_key_cookie = APIKeyCookie(name="access_token", auto_error=False)


def get_api_cookie(
    access_token: str = Security(api_key_cookie),
) -> dict[str, str]:
    """Dependency to retrieve and validate an API cookie (JWT token).

    Args:
        access_token (str): The session key retrieved from the cookie.

    Returns:
        dict: The current user session data if valid.

    Raises:
        HTTPException: If the token is invalid or an exception occurs.
    """
    if access_token:
        current_user = auth_session_manager.validate_token(access_token)

        if current_user:
            return current_user
        else:
            raise UnauthorizedError("Session not found or expired")
    else:
        raise UnauthorizedError("Not authenticated")
