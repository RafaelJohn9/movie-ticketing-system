"""Attendance Repository for the movie ticketing system."""

from sqlalchemy.orm import Session

from app.models.attendance import Attendance


class AttendanceRepository:
    """Repository for managing attendance records."""

    @staticmethod
    async def create(db: Session, attendance_data: dict) -> Attendance:
        """Create a new attendance record."""
        attendance = Attendance(**attendance_data)
        db.add(attendance)
        db.commit()
        db.refresh(attendance)
        return attendance

    @staticmethod
    async def get_by_ticket_id(db: Session, ticket_id: str) -> Attendance | None:
        """Retrieve an attendance record by ticket ID."""
        return db.query(Attendance).filter_by(ticket_id=ticket_id).first()

    @staticmethod
    async def list_by_event(db: Session, event_id: str) -> list[Attendance]:
        """Retrieve all attendance records for an event."""
        return db.query(Attendance).join(
            Attendance.ticket
        ).filter_by(event_id=event_id).all()

    @staticmethod
    async def update(db: Session, ticket_id: str, attendance_data: dict) -> Attendance | None:
        """Update an attendance record."""
        attendance = await AttendanceRepository.get_by_ticket_id(db, ticket_id)
        if attendance:
            for key, value in attendance_data.items():
                setattr(attendance, key, value)
            db.commit()
            db.refresh(attendance)
        return attendance
