from enum import Enum


class TicketStatus(str, Enum):
    PENDING = "Pending"
    CANCELLED = "Cancelled"
    BOUGHT = "Bought"
    AVAILABLE = "Available"
