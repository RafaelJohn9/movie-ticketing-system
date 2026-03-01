"""Templated email service using Jinja2 and an email provider."""

import base64
import os
from datetime import datetime

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
        full_name: str,
        phone_number: str,
        ticket_id: str,
        qr_code_b64: str,
        ticket_type: str,
    ) -> None:
        """Send movie ticket email with embedded QR code (CID).

        Args:
            to: Recipient email address.
            full_name: Attendee's full name.
            phone_number: Attendee's phone number.
            ticket_id: Unique ticket identifier.
            qr_code_b64: Base64-encoded QR image.
            ticket_type: Type of ticket purchased (Regular, VIP, Group).
        """
        template = self.jinja_env.get_template("ticket.html")

        html_body = template.render(
            full_name=full_name,
            phone_number=phone_number,
            ticket_id=ticket_id,
            ticket_type=ticket_type,
            now_year=datetime.now().year,
        )

        qr_bytes: bytes = base64.b64decode(qr_code_b64)

        await self.provider.send_email(
            to=to,
            subject="🎬 Your MUTCU Film Premiere Ticket",
            html_body=html_body,
            inline_attachments=[
                {
                    "filename": "qrcode.png",
                    "content": qr_bytes,
                    "content_id": "qrcode",   # matches cid:qrcode in template
                }
            ],
        )


email_service = EmailService()