"""User service module."""

from datetime import datetime

from sqlalchemy.orm import Session
from pytz import UTC

from app.core.exceptions import ResourceNotFoundError
from app.models import User
from app.repositories.user_repository import UserRepository
from app.utils.enums import RoleEnum
from app.schemas.user import UserLogin, UserAttendanceResponse
from app.security import verify_password

class UserService:
    """Service class for handling User operations."""

    def __init__(self, db: Session):
        self.db = db

    async def create_user(self, user_data: dict) -> User:
        """Create a new user."""
        return await UserRepository.create(self.db, user_data)

    async def get_user_by_email(self, email: str) -> User | None:
        """Retrieve a user by email."""
        return await UserRepository.get_by_fields(self.db, email=email)

    async def get_user_by_phone(self, phone_number: str) -> User | None:
        """Retrieve a user by phone number."""
        return await UserRepository.get_by_fields(self.db, phone_number=phone_number)

    async def get_all_users(self) -> list[UserAttendanceResponse]:
        """Retrieve all users with RoleEnum.USER role and their attendance details."""
        users = await UserRepository.get_filtered(self.db, role=RoleEnum.USER)
        return [
            UserAttendanceResponse(
                id=user.id,
                full_name=user.full_name,
                email=user.email,
                phone_number=user.phone_number,
                ticket_type=user.ticket.ticket_type if user.ticket else None,
                has_attended=user.has_attended,
                attended_at=user.attended_at.isoformat() if user.attended_at else None,
                payment_status=user.payment.status if user.payment else None,
            )
            for user in users
        ]

    async def update_user_attendance(self, user_id: str, has_attended: bool) -> User:
        """Update the attendance status of a user."""
        # Check if the user exists before updating
        user = await UserRepository.get_by_fields(self.db, id=user_id)

        if not user:
            raise ResourceNotFoundError(f"User does not exist.")

        attended_at = datetime.now(UTC) if has_attended else None
        return await UserRepository.update(
            db=self.db,
            user_id=user_id,
            has_attended=has_attended,
            attended_at=attended_at
        )

    async def authenticate_admin_user(self, login_data: UserLogin) -> User | None:
        """Authenticate an admin user by email and password."""
        user = await self.get_user_by_email(login_data.email)

        if user and user.role == RoleEnum.ADMIN and verify_password(login_data.password, user.password):
            return user

        return None
