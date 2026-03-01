"""User repository module."""

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.exceptions import ResourceAlreadyExistsError
from app.models import User


class UserRepository:
    """Repository class for handling User operations."""

    @staticmethod
    async def create(db: Session, user_data: dict) -> User:
        """Create a new user."""
        user = User(**user_data)
        # Check all unique constraints before creating
        conditions = []
        if user.email:
            conditions.append(User.email == user.email)
        if user.phone_number:
            conditions.append(User.phone_number == user.phone_number)

        if conditions:
            existing = db.execute(
                db.query(User).filter(or_(*conditions))
            ).scalar_one_or_none()
            if existing:
                conflicts = []
                for field in ("email", "phone_number"):
                    val = getattr(user, field, None)
                    if val and getattr(existing, field, None) == val:
                        conflicts.append(field)
                raise ResourceAlreadyExistsError(
                    f"Fields: {', '.join(conflicts)} already exists."
                )

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    async def get_by_fields(db: Session, **kwargs) -> User | None:
        """Retrieve a user by multiple fields."""
        query = db.query(User)
        for field, value in kwargs.items():
            query = query.filter(getattr(User, field) == value)
        return query.first()

    @staticmethod
    async def get_filtered(db: Session, **filters) -> list[User]:
        """Retrieve users with specified filters."""
        query = db.query(User)
        for field, value in filters.items():
            if hasattr(User, field):
                query = query.filter(getattr(User, field) == value)
        return query.all()

    @staticmethod
    async def update(db: Session, user_id: str, **kwargs) -> User | None:
        """Update a user by ID."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        for field, value in kwargs.items():
            if hasattr(user, field):
                setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user
