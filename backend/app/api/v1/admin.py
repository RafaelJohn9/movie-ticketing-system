"""Admin API routes for the movie ticketing system."""

from typing import Any
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.core.exceptions import QRCodeAlreadyScannedError
from app.depends import require_role, get_api_cookie
from app.db import get_db
from app.utils.enums import RoleEnum
from app.schemas.user import UserLogin, UserAttendanceResponse
from app.services.user_service import UserService
from app.services.ticket_service import TicketService
from app.security import auth_session_manager




router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", status_code=204)
async def login_admin(
    user_data: UserLogin,
    response: Response,
    db: Session = Depends(get_db),
) -> None:
    """Login an admin user and set the access token cookie."""
    user_service = UserService(db)
    user = await user_service.authenticate_admin_user(user_data)

    if not user:
        raise ValueError("Invalid admin credentials")

    user_dict = {"id": str(user.id), "email": user.email, "role": user.role}
    access_token = auth_session_manager.create_token(payload=user_dict)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        path="/",
        secure=False,
        samesite="lax",
    )


@router.patch("/users/{user_id}/attendance", status_code=204)
async def update_user_attendance(
    user_id: str,
    has_attended: bool,
    _: dict[str, str] = Depends(require_role([RoleEnum.ADMIN])),
    db: Session = Depends(get_db),
) -> None:
    """Update a user's attendance status."""
    user_service = UserService(db)
    await user_service.update_user_attendance(user_id, has_attended)


@router.post("/tickets/scan", status_code=204)
async def scan_qr_ticket(
    qr_token: str,
    _: dict[str, str] = Depends(require_role([RoleEnum.ADMIN])),
    db: Session = Depends(get_db),
) -> None:
    """Scan QR code ticket and mark user as attended."""
    ticket_service = TicketService()
    ticket = await ticket_service.verify_ticket(db, qr_token)

    user_service = UserService(db)
    await user_service.update_user_attendance(ticket.user_id, True)

@router.get("/users/attendance")
async def list_user_attendance(
    _: dict[str, str] = Depends(require_role([RoleEnum.ADMIN])),
    db: Session = Depends(get_db),
) -> list[UserAttendanceResponse]:
    """List all users with attendance information."""
    user_service = UserService(db)
    users = await user_service.get_all_users()
    return users
