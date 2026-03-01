"""Ticket model for the movie ticketing system."""

from datetime import datetime

from pytz import UTC
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.utils.enums import TicketType

from .base.component_base import ComponentBase


class Ticket(ComponentBase):
    """Ticket model for the movie ticketing system.

    Attributes:
        ticket_number (str): A unique identifier for the ticket.
        user_id (str): The ID of the user who purchased the ticket.
        ticket_type_id (str): The ID of the type of ticket purchased.
        status (str): The current status of the ticket (e.g., 'active', 'used').
        qr_token (str): A unique token for the QR code associated with the ticket.
        is_scanned (bool): A flag indicating whether the QR code has been scanned.
        issued_at (datetime): The timestamp when the ticket was issued.

    Relationships:
        user (User): The user associated with the ticket.
        ticket_type (TicketType): The type of ticket associated with the ticket.
    """

    __tablename__ = 'tickets'

    ticket_number = Column(String(50), unique=True, nullable=False)
    user_id = Column(String(55), ForeignKey('users.id'), nullable=False)
    ticket_type = Column(String(55), default=TicketType.REGULAR, nullable=False)
    status = Column(String(20), nullable=False)
    qr_token = Column(String(255), unique=True, nullable=False)
    is_scanned = Column(Boolean, default=False)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    user = relationship("User", back_populates="ticket", uselist=False)
    payment = relationship("Payment", back_populates="ticket", uselist=False)
