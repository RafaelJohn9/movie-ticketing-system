"""Manages JWTs with strict separation by token type."""

import datetime
from typing import Any

import jwt

from app.settings import settings
from app.utils.enums import TokenType


class TokenManager:
    """Generic JWT manager configured per token type."""

    def __init__(self, token_type: TokenType, expires_in: int):
        """Initialize the TokenManager."""
        self.secret_key = settings.jwt_secret_key
        self.algorithm = "HS256"
        self.token_type = token_type
        self.expires_in = expires_in

    def create_token(self, payload: dict[str, Any]) -> str:
        """Create a JWT token with the specified payload and token type."""
        now = datetime.datetime.now(datetime.timezone.utc)
        payload = {
            **payload,
            "exp": now + datetime.timedelta(seconds=self.expires_in),
            "iat": now,
            "aud": self.token_type.value,
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def validate_token(self, token: str) -> dict[str, Any] | None:
        """Validate a JWT token ensuring it matches the expected token type."""
        try:
            return jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                audience=self.token_type.value,
            )
        except (
            jwt.ExpiredSignatureError,
            jwt.InvalidTokenError,
            jwt.InvalidAudienceError,
        ):
            return None


# Pre-configured TokenManagers for different token types
auth_session_manager = TokenManager(TokenType.AUTH_SESSION, expires_in=3600)
email_verification_manager = TokenManager(
    TokenType.EMAIL_VERIFICATION, expires_in=600
)
password_reset_manager = TokenManager(TokenType.PASSWORD_RESET, expires_in=900)
