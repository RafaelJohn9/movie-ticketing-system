"""User model definition."""

from sqlalchemy import (
    Column,
    DateTime,
    String,
    Boolean
)
from sqlalchemy.orm import relationship

from app.utils.enums import RoleEnum

from .base import ComponentBase


class User(ComponentBase):
    """User model inheriting from ComponentBase.

    Attributes:
        email (str): The user's email address.
        password (str): The hashed password for the user.
        role (str): The role of the user in the application.
        full_name (str): The user's full name.
        has_attended (bool): A flag indicating if the user has attended an event.
    """

    __tablename__ = "users"

    email = Column(String(55), unique=True, index=True, nullable=False)
    phone_number = Column(String(55), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=True)
    role = Column(String(55), default=RoleEnum.USER)
    full_name = Column(String(255))
    has_attended = Column(Boolean, default=False)
    attended_at = Column(DateTime(timezone=True), nullable=True)

    ticket = relationship("Ticket", back_populates="user", uselist=False)
    payment = relationship("Payment", back_populates="user", uselist=False)
