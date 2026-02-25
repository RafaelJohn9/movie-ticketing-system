"""Service for QR code generation and manipulation."""

import base64
import io
from typing import Final

import segno


class QRService:
    """Service for QR code generation and manipulation."""

    _PNG_FORMAT: Final[str] = "png"

    def __init__(self, box_size: int = 10, border: int = 4) -> None:
        """Initialize QRService.

        Args:
            box_size: Size multiplier of QR modules.
            border: Border size in QR modules.
        """
        self.box_size = box_size
        self.border = border

    def generate_qr_bytes(self, data: str) -> bytes:
        """Generate a QR code from data and return as bytes.

        Args:
            data: Data to encode in QR code.

        Returns:
            Bytes of the PNG image.
        """
        qr = segno.make(data)

        buffer = io.BytesIO()
        qr.save(
            buffer,
            kind=self._PNG_FORMAT,
            scale=self.box_size,
            border=self.border,
        )

        buffer.seek(0)
        return buffer.getvalue()

    def generate_qr_base64(self, data: str) -> str:
        """Generate a QR code from data and return as base64 string.

        Args:
            data: Data to encode in QR code.

        Returns:
            Base64-encoded PNG image string.
        """
        qr = segno.make(data)

        buffer = io.BytesIO()
        qr.save(
            buffer,
            kind=self._PNG_FORMAT,
            scale=self.box_size,
            border=self.border,
        )

        buffer.seek(0)
        encoded: str = base64.b64encode(buffer.read()).decode("utf-8")
        return encoded