"""Base model for all models in the application."""

from datetime import datetime
import uuid

import pytz
from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.ext.declarative import as_declarative

# Use EAT (East Africa Time, UTC+3)
UTC = pytz.timezone("Africa/Nairobi")


@as_declarative()
class Base:
    """Base class for the models."""

    pass


class ComponentBase(Base):
    """Abstract base class for all components.

    This class provides a common `id` field with a UUID-based primary key.
    It serves as the foundation for other SQLAlchemy models in the application.
    """

    __abstract__ = True

    @staticmethod
    def generate_uuid() -> str:
        """Generate a new UUID as a string.

        Returns:
            str: A randomly generated UUID.
        """
        return str(uuid.uuid4())

    id = Column(
        String(55),
        primary_key=True,
        default=generate_uuid,
        unique=True,
        index=True,
    )
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    date_created = Column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    last_modified = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
