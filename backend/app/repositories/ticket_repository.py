"""Ticket repository for the movie ticketing system."""

from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.utils.enums import TicketStatus


class TicketRepository:
    """Repository class for managing Ticket entities in the database."""

    @staticmethod
    async def create(db: Session, ticket_data: dict) -> Ticket:
        """Create a new ticket in the database."""
        ticket = Ticket(**ticket_data)
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    async def get_by_id(db: Session, ticket_id: str) -> Ticket | None:
        """Retrieve a ticket by its ID."""
        return db.query(Ticket).filter(Ticket.id == ticket_id).first()

    @staticmethod
    async def get_by_qr_token(db: Session, qr_token: str) -> Ticket | None:
        """Retrieve a ticket by its QR token."""
        return db.query(Ticket).filter(Ticket.qr_token == qr_token).first()

    @staticmethod
    async def update_status(db: Session, ticket_id: str, new_status: TicketStatus) -> Ticket | None:
        """Update the status of a ticket."""
        ticket = await TicketRepository.get_by_id(db, ticket_id)
        if ticket:
            ticket.status = new_status
            db.commit()
            db.refresh(ticket)
        return ticket

    @staticmethod
    async def update(db: Session, ticket_id: str, **kwargs) -> Ticket | None:
        """Update a ticket with the provided data."""
        ticket = await TicketRepository.get_by_id(db, ticket_id)
        if ticket:
            for key, value in kwargs.items():
                setattr(ticket, key, value)
            db.commit()
            db.refresh(ticket)
        return ticket
