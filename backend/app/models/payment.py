"""Payment model for the movie ticketing system."""

from sqlalchemy import Column, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import relationship

from .base.component_base import ComponentBase


class Payment(ComponentBase):
    """Model representing a payment for a movie ticket.

    Attributes:
        ticket_id (str): The ID of the associated ticket, must be a valid foreign key.
        mpesa_checkout_id (str): Unique identifier for the M-Pesa checkout transaction.
        mpesa_receipt (str, optional): Unique receipt number for the M-Pesa transaction.
        amount (float): The amount paid in Kenyan Shillings.
        status (str): The current status of the payment (e.g., 'completed', 'pending').
        raw_callback (dict, optional): Raw JSON callback data from the payment gateway.
        paid_at (datetime, optional): Timestamp of when the payment was made.

    Relationships:
        ticket (Ticket): The ticket associated with this payment.
    """

    __tablename__ = 'payments'

    ticket_id = Column(String(55), ForeignKey('tickets.id'), nullable=True)
    mpesa_checkout_id = Column(String(55), unique=True, nullable=True)
    mpesa_receipt = Column(String(55), unique=True, nullable=True)
    user_id = Column(String(55), ForeignKey('users.id'), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)
    raw_callback = Column(String(1000), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="payment", uselist=False)
    ticket = relationship("Ticket", back_populates="payment", uselist=False)
