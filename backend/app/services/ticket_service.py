"""Ticket service for the movie ticketing system."""


import uuid

from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.repositories.ticket_repository import TicketRepository


class TicketService:
    """Service class for managing ticket operations."""

    @staticmethod
    def generate_ticket_number() -> str:
        """Generate a unique ticket number."""
        return str(uuid.uuid4())

    def generate_qr_token(self) -> str:
        """Generate a unique QR token."""
        return str(uuid.uuid4())

    async def create_ticket(self, db: Session, user_id: str, ticket_type: str) -> Ticket:
        """Create a new ticket."""
        ticket_data = {
            "ticket_number": self.generate_ticket_number(),
            "user_id": user_id,
            "ticket_type": ticket_type,
            "status": "active",
            "qr_token": self.generate_qr_token(),
            "qr_used": False
        }
        return await TicketRepository.create(db, ticket_data)


    async def verify_ticket(self, db: Session, qr_token: str) -> Ticket | None:
        """Verify a ticket using its QR token."""
        return await TicketRepository.get_by_qr_token(db, qr_token)
