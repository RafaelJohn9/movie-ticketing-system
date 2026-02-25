"""Custom exception classes for the application."""


class AppException(Exception):
    """Base exception for all application-level errors."""

    pass


# === Client Errors (4xx) ===


class ClientError(AppException):
    """Errors caused by client actions (invalid input, auth, etc.)."""

    pass


class AuthenticationError(ClientError):
    """Raised when user is not authenticated."""

    pass


class AuthorizationError(ClientError):
    """Raised when user lacks permission."""

    pass


class ValidationError(ClientError):
    """Raised when input data is invalid."""

    pass


class NotFoundError(ClientError):
    """Raised when a resource is not found."""

    pass


class ConflictError(ClientError):
    """Raised when request conflicts with current state (e.g., duplicate)."""

    pass


class LockedError(ClientError):
    """Raised when resource is temporarily locked."""

    pass


class ExternalServiceError(ClientError):
    """Raised when an external service returns an error."""

    pass


# === Concrete Exceptions (mapped to categories) ===


class UnauthorizedError(AuthenticationError):
    """User is not authenticated."""

    pass

class PermissionDeniedError(AuthorizationError):
    """User lacks required role/permission."""

    pass


class ResourceAlreadyExistsError(ConflictError):
    """Resource being created already exists."""

    pass


class ResourceDeletedError(NotFoundError):
    """Requested resource has been deleted."""

    pass


class ResourceNotFoundError(NotFoundError):
    """Requested resource (e.g., chama) does not exist."""

    pass


class InputValidationError(ValidationError):
    """Input by User is not as expected."""

    pass


class ResourceLockedError(LockedError):
    """Resource is temporarily locked (e.g., during processing)."""

    pass
