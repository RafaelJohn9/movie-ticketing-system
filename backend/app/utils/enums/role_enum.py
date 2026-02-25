"""Model for Roles to be given.

This will define the Enum Class that will hold the Roles.
Classes:
    RoleEnum
"""

from enum import Enum


class RoleEnum(str, Enum):
    """A class to represent Role names to be used."""

    ADMIN = "admin"
    USER = "user"
    COURIER = "courier"
