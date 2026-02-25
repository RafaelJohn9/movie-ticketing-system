# """TicketType model for the movie ticketing system."""

# from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
# from sqlalchemy.orm import relationship

# from app.models.base.component_base import ComponentBase


# class TicketType(ComponentBase):
#     """Model representing a type of ticket for an event."""

#     __tablename__ = 'ticket_types'

#     event_id = Column(String(55), ForeignKey('events.id'), nullable=False)
#     name = Column(String(100), nullable=False)
#     price_ksh = Column(Numeric(10, 2), nullable=False)
#     quantity_total = Column(Integer, nullable=False)
#     quantity_sold = Column(Integer, default=0)
#     group_size = Column(Integer, nullable=False)

#     event = relationship("Event", back_populates="ticket_types")
