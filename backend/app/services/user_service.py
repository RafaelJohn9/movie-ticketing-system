"""User service module."""

from sqlalchemy.orm import Session

from app.models import User
from app.repositories.user_repository import UserRepository


class UserService:
    """Service class for handling User operations."""

    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository()

    async def create_user(self, user_data: dict) -> User:
        """Create a new user."""
        return await self.user_repository.create(self.db, user_data)

    async def get_user_by_email(self, email: str) -> User | None:
        """Retrieve a user by email."""
        return await self.user_repository.get_by_fields(self.db, email=email)

    async def get_user_by_phone(self, phone_number: str) -> User | None:
        """Retrieve a user by phone number."""
        return await self.user_repository.get_by_fields(self.db, phone_number=phone_number)
