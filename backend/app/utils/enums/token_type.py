"""Enumeration of supported JWT token types."""

from enum import Enum


class TokenType(str, Enum):
    """Enumeration of supported JWT token types."""

    AUTH_SESSION = "auth_session"
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"
