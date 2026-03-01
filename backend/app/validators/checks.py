"""Validators to check resource existence and status."""

from typing import TypeVar

from app.core.exceptions import (
    ResourceDeletedError,
    ResourceLockedError,
    ResourceNotFoundError,
)
from app.models.base import ComponentBase

T = TypeVar("T", bound=ComponentBase)


def ensure_resource_exists(model: T | None, check_is_active: bool = True) -> T:
    """Dependency to ensure a resource exists in the database.

    Args:
        model (ComponentBase): The SQLAlchemy model to check.
        check_is_active (bool): Check if a certain resource is active.
    """
    if not model:
        raise ResourceNotFoundError("Resource Not Found.")
    elif model.is_deleted:
        raise ResourceDeletedError(f"{model.__class__.__name__} not available.")
    elif check_is_active is True and not model.is_active:
        raise ResourceLockedError(
            f"{model.__class__.__name__} is no longer active."
        )
    return model
