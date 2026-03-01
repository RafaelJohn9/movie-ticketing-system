"""Schemas for ticket management in the Movie Ticketing System."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator
from pytz import UTC

from app.utils.enums import TicketType
from app.utils.phone import normalize_phone_number


class TicketBase(BaseModel):
    """Base schema for ticket operations."""
    ticket_number: str = Field(..., max_length=50)
    user_id: str = Field(..., max_length=55)
    ticket_type: TicketType = Field(..., max_length=55)
    status: str = Field(..., max_length=20)
    qr_token: str = Field(..., max_length=255)
    qr_used: bool = False
    issued_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

class TicketCreate(TicketBase):
    """Schema for creating a new ticket."""
    pass

class TicketUpdate(BaseModel):
    """Schema for updating ticket information."""
    status: str | None = Field(None, max_length=20)
    qr_used: bool | None = None


class TicketRead(BaseModel):
    """Schema for reading ticket information."""
    full_name: str = Field(..., max_length=100)
    phone_number: str = Field(..., max_length=15)
    qr_image: str = Field(..., description="Base64-encoded QR code image")
    ticket_type: TicketType

class TicketPurchase(BaseModel):
    """Schema for purchasing a ticket."""
    phone_number: str = Field(..., max_length=15)
    email: str = Field(..., max_length=100)
    ticket_type: TicketType
    full_name: str = Field(..., max_length=100)

    @field_validator('phone_number')
    def validate_phone_number(cls, value):
        """Validate and format the phone number."""
        formatted_number = normalize_phone_number(value)
        if not formatted_number:
            raise ValueError("Invalid phone number format.")
        return formatted_number

class SendTicketRequest(BaseModel):
    """Schema for sending a ticket to a user."""
    email: str = Field(..., max_length=100)
