"""Pydantic schemas for payment in the movie ticketing system."""

from datetime import datetime

from pydantic import BaseModel, Field


class PaymentBase(BaseModel):
    """Base schema for payment operations."""
    ticket_id: str | None = Field(None, description="The ID of the associated ticket.")
    mpesa_checkout_id: str = Field(..., description="Unique identifier for the M-Pesa checkout transaction.")
    mpesa_receipt: str | None = Field(None, description="Unique receipt number for the M-Pesa transaction.")
    amount_ksh: float = Field(..., description="The amount paid in Kenyan Shillings.")
    status: str = Field(..., description="The current status of the payment (e.g., 'completed', 'pending').")
    raw_callback: dict | None = Field(None, description="Raw JSON callback data from the payment gateway.")
    paid_at: datetime | None = Field(None, description="Timestamp of when the payment was made.")

class PaymentCreate(PaymentBase):
    """Schema for creating a new payment."""
    pass

class PaymentUpdate(PaymentBase):
    """Schema for updating an existing payment."""
    pass

class PaymentResponse(PaymentBase):
    """Schema for returning payment information."""
    class Config:
        orm_mode = True
