# """Event model for the movie ticketing system."""
# from sqlalchemy import Column, DateTime, Integer, String

# from app.models.base.component_base import ComponentBase


# class Event(ComponentBase):
#     """Event model representing a movie event."""

#     __tablename__ = "events"

#     name = Column(String(255), nullable=False, index=True)
#     description = Column(String(1000), nullable=True)
#     event_date = Column(DateTime(timezone=True), nullable=False, index=True)
#     venue = Column(String(255), nullable=False)
#     capacity = Column(Integer, nullable=False)

#     def __repr__(self) -> str:
#         """String representation of the Event model."""
#         return f"<Event(id={self.id}, name={self.name}, event_date={self.event_date})>"
