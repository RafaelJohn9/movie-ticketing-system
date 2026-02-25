"""Concrete SMTP email provider implementation."""

import asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from functools import partial
import smtplib
from email.mime.image import MIMEImage
from app.settings import settings
from .base import EmailProvider


class SMTPProvider(EmailProvider):
    """Concrete email provider using SMTP (e.g., Gmail, Outlook, etc.).

    Uses app settings for server, credentials, and sender address.
    """

    def __init__(self):
        """Initialize SMTP provider with settings."""
        self.smtp_server = settings.smtp_server
        self.smtp_port = settings.smtp_port
        self.username = settings.smtp_username
        self.password = settings.smtp_password
        self.sender_email = settings.smtp_sender_email

    async def send_email(
        self,
        to: str,
        subject: str,
        html_body: str,
        plain_body: str | None = None,
        inline_attachments: list[dict] | None = None,
    ) -> None:
        """Send an email with HTML + inline images."""

        # Top-level container
        msg = MIMEMultipart("related")
        msg["Subject"] = subject
        msg["From"] = self.sender_email
        msg["To"] = to

        # Multipart/alternative for text + HTML
        alt = MIMEMultipart("alternative")
        # Attach plain text
        alt.attach(
            MIMEText(plain_body if plain_body else "View this email in an HTML client", "plain")
        )
        # Attach HTML
        alt.attach(MIMEText(html_body, "html"))

        # Attach alternative part to top-level
        msg.attach(alt)

        # Attach inline images
        if inline_attachments:
            for attachment in inline_attachments:
                part = MIMEImage(attachment['content'], _subtype='png')
                part.add_header(
                    'Content-Disposition',
                    f'inline; filename="{attachment["filename"]}"'
                )
                part.add_header('Content-ID', f'<{attachment["content_id"]}>')
                msg.attach(part)

        # Send via SMTP in thread
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, partial(self._send_via_smtp, msg=msg, to=to))

    def _send_via_smtp(self, msg: MIMEMultipart, to: str) -> None:
        """Blocking SMTP send — called from thread."""
        if self.smtp_port == 465:
            with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as server:
                server.login(self.username, self.password)
                server.send_message(msg, to_addrs=[to])
        else:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg, to_addrs=[to])
