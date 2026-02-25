"""Abstract base class for email providers."""

from abc import ABC, abstractmethod


class EmailProvider(ABC):
    """Abstract base class defining the interface for all email providers.

    Any concrete email provider (e.g., SMTP, SendGrid, Mailgun) must implement
    the `send_email` method to enable transactional emails like:
    - Email verification
    - Password reset
    - Delivery confirmations

    This abstraction allows the core application logic to remain agnostic
    of the underlying email delivery mechanism.
    """

    @abstractmethod
    async def send_email(
        self,
        to: str,
        subject: str,
        html_body: str,
        plain_body: str | None = None,
        inline_attachments: list[dict] | None = None,
    ) -> None:
        """Send an email with pre-rendered content.

        Args:
            to (str): Recipient email address.
            subject (str): Email subject line.
            html_body (str): Full HTML body of the email.
            plain_body (Optional[str]): Plain-text fallback. If not provided,
                                       a minimal plain version may be derived
                                       from html_body or omitted.
            inline_attachments (Optional[List[Dict]]): List of inline attachments,
                each dict should contain:
                - filename (str): Name of the file (e.g., 'qrcode.png').
                - content (bytes): Binary content of the file.
                - content_id (str): Unique identifier for referencing in HTML (e.g., 'qr_code').
                - mime_type (str): MIME type of the file (e.g., 'image/png').

        Raises:
            EmailSendError: If sending fails (implementation-specific).
        """
        pass
