"""Enumeration for payment statuses in the movie ticketing system."""

from enum import Enum


class PaymentStatus(str, Enum):
    """Enumeration for payment statuses in the movie ticketing system."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
