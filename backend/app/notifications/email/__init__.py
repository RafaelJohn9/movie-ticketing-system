"""Email notification package."""

from .email_service import EmailService
from .provider.smtp import SMTPProvider

__all__ = ["EmailService", "SMTPProvider"]
