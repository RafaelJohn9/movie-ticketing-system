# """Attendance model for tracking ticket attendance."""

# from datetime import datetime

# from pytz import UTC
# from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
# from sqlalchemy.orm import relationship

# from app.models.base.component_base import ComponentBase


# class Attendance(ComponentBase):
#     """Model representing attendance for a ticket."""

#     __tablename__ = 'attendance'

#     ticket_id = Column(String(55), ForeignKey('tickets.id'), unique=True, nullable=False)
#     is_present = Column(Boolean, default=False)
#     scanned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

#     ticket = relationship("Ticket", back_populates="attendance_records")
