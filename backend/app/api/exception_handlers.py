"""Global exception handlers for the FastAPI application."""

from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    ExternalServiceError,
    LockedError,
    NotFoundError,
    ValidationError,
)

# Status code mapping by exception category
STATUS_CODES = {
    AuthenticationError: 401,
    AuthorizationError: 403,
    ValidationError: 422,
    NotFoundError: 404,
    ConflictError: 409,
    LockedError: 423,  # HTTP 423 Locked
    ExternalServiceError: 502,  # HTTP 502 Bad Gateway
}


def app_exception_handler(
    request: Request,  # noqa
    exc: Exception,
) -> JSONResponse:
    """Global handler for all AppException subclasses."""
    for exc_type, status_code in STATUS_CODES.items():
        if isinstance(exc, exc_type):
            return JSONResponse(
                status_code=status_code,
                content={"detail": str(exc) or exc.__class__.__name__},
            )

    # Fallback: treat as internal server error (500)
    # TODO:
    # In production, log this!
    return JSONResponse(
        status_code=500, content={"detail": "An unexpected error occurred"}
    )
