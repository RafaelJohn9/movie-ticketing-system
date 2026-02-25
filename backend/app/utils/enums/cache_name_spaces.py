"""This module contains the SessionNameSpaces enum class."""

from enum import Enum


class CacheNameSpaces(str, Enum):
    """Enum class for Cache NameSpaces."""

    EMAIL_VERIFICATION = "email_verification_ns"
    ONLINE_COURIERS = "online_couriers_ns"
    COURIER_LOCATION = "courier_location_ns"
