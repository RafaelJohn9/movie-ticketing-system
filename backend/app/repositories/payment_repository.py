"""Payment Repository for the movie ticketing system."""

from sqlalchemy.orm import Session

from app.models.payment import Payment
from app.utils.enums import PaymentStatus


class PaymentRepository:
    """Repository for managing payment records."""

    @staticmethod
    async def create(db: Session, payment_data: dict) -> Payment:
        """Create a new payment record."""
        payment = Payment(**payment_data)
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    async def get_by_checkout_id(db: Session, checkout_id: str) -> Payment | None:
        """Retrieve a payment by its M-Pesa checkout ID."""
        return db.query(Payment).filter_by(mpesa_checkout_id=checkout_id).first()

    @staticmethod
    async def get_by_user_id(db: Session, user_id: str) -> Payment | None:
        """Retrieve a payment by its user ID."""
        return db.query(Payment).filter_by(user_id=user_id).first()

    @staticmethod
    async def update_field(db: Session, payment_id: str, field: str, value: any) -> Payment | None:
        """Update a specific field for a payment."""
        payment = db.query(Payment).filter_by(id=payment_id).first()
        if payment:
            setattr(payment, field, value)
            db.commit()
            db.refresh(payment)
        return payment

    @staticmethod
    async def update_status(db: Session, payment_id: str, new_status: PaymentStatus) -> Payment | None:
        """Update the status of a payment."""
        payment = db.query(Payment).filter_by(id=payment_id).first()
        if payment:
            payment.status = new_status
            db.commit()
            db.refresh(payment)
        return payment
