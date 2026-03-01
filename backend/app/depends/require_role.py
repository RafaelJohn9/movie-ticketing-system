"""Dependencies to enforce role-based access control."""

from collections.abc import Callable, Coroutine
from typing import Any

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.exceptions import PermissionDeniedError
from app.db import get_db
from app.depends.get_api_cookie import get_api_cookie
from app.repositories import UserRepository
from app.utils.enums import RoleEnum
from app.validators import ensure_resource_exists


def require_role(
    allowed: list[RoleEnum],
) -> Callable[..., Coroutine[Any, Any, dict[str, str]]]:
    """Dependency to require a system-level role for access control."""

    async def checker(
        current_user: dict[str, str] = Depends(get_api_cookie),
        db: Session = Depends(get_db),
    ) -> dict[str, str]:
        """Check if the current user has an allowed system role."""
        user = ensure_resource_exists(
            await UserRepository.get_by_fields(db, id=current_user["id"])
        )

        if RoleEnum(user.role) not in allowed:
            raise PermissionDeniedError(
                "You do not have enough permissions to perform this action."
            )
        return current_user

    return checker
