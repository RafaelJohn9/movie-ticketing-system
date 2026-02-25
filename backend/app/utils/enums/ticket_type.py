"""This module defines the TicketType enumeration for categorizing different types of movie tickets."""
from enum import Enum


class TicketType(str, Enum):
    """Enumeration for different types of movie tickets."""
    REGULAR = "Regular"
    GROUP = "Group"
    VIP = "VIP"
