"""Templated email service using Jinja2 and an email provider."""

import base64
import os

from jinja2 import Environment, FileSystemLoader

from .provider.base import EmailProvider
from .provider.smtp import SMTPProvider


class EmailService:
    """Email service that receives provider and handles templated emails."""

    def __init__(self, provider: EmailProvider | None = None):
        """Initialize with an email provider (defaults to SMTP)."""
        self.provider = provider or SMTPProvider()
        template_dir = os.path.join(os.path.dirname(__file__), "templates")
        self.jinja_env = Environment(loader=FileSystemLoader(template_dir))


    async def send_ticket_email(
        self,
        to: str,
        ticket_id: str,
        qr_code_b64: str,
        ticket_type: str,
    ) -> None:
        """Send movie ticket email with embedded QR code (CID).

        Args:
            to: Recipient email address.
            ticket_id: Unique ticket identifier.
            qr_code_b64: Base64 encoded QR image.
            ticket_type: Type of ticket purchased.
        """
        template = self.jinja_env.get_template("ticket.html")

        # We no longer pass base64 into HTML
        html_body = template.render(
            ticket_id=ticket_id,
            ticket_type=ticket_type,
        )

        # Convert base64 back to bytes
        qr_bytes: bytes = base64.b64decode(qr_code_b64)

        await self.provider.send_email(
            to=to,
            subject="CU Film Ticket",
            html_body=html_body,
            inline_attachments=[
                {
                    "filename": "qrcode.png",
                    "content": qr_bytes,
                    "content_id": "qr_code",
                    "mime_type": "image/png",
                }
            ],
        )

email_service = EmailService()
