"""This module defines API endpoints for handling ticket purchases and M-Pesa payment confirmations.

It includes logic for user management, payment processing, and ticket generation, as well as
security checks for M-Pesa callbacks.
"""
import asyncio

from fastapi import APIRouter, Depends, HTTPException, Request
from mpesakit.mpesa_express.schemas import (
    StkPushSimulateCallback,
    StkPushSimulateCallbackResponse,
)
from mpesakit.security import is_mpesa_ip_allowed
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.db.get_db import get_db
from app.notifications.email.email_service import email_service
from app.repositories.payment_repository import PaymentRepository
from app.schemas import SendTicketRequest, TicketPurchase, TicketRead
from app.services import MpesaService, TicketService, UserService
from app.services.qr_service import QRService
from app.utils.enums import PaymentStatus, TicketType

ticket_router = APIRouter(tags=["tickets"])

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

TICKET_PRICES: dict[TicketType, int] = {
    TicketType.REGULAR: 100,
    TicketType.VIP: 200,
    TicketType.GROUP: 400,
}

POLL_INTERVAL_SECONDS = 5
POLL_MAX_ATTEMPTS = 8


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------


async def _poll_payment_status(
    db: Session,
    user_id: str,
    user_full_name: str,
    payment_id: str,
) -> None:
    """Poll the DB until the payment leaves PENDING state or attempts are exhausted.

    Args:
        db: Database session.
        user_id: User primary key — used to re-fetch the payment each iteration.
        user_full_name: Used only for structured log messages.
        payment_id: Payment primary key — used only for log messages.
    """
    for _ in range(POLL_MAX_ATTEMPTS):
        await asyncio.sleep(POLL_INTERVAL_SECONDS)
        db.expire_all()  # Ensure we read the latest data written by the webhook handler.

        payment = await PaymentRepository.get_by_user_id(db, user_id)
        if payment and payment.status != PaymentStatus.PENDING:
            logger.info(
                "Payment status updated for user: %s, status: %s",
                user_full_name,
                payment.status,
            )
            return

        logger.info(
            "Payment still pending for id: %s, status: %s",
            payment_id,
            payment.status if payment else "unknown",
        )


async def _initiate_and_poll(
    db: Session,
    payment_id: str,
    user_id: str,
    user_full_name: str,
    phone_number: str,
    amount: int,
    mpesa_service: MpesaService,
    account_reference: str = "Tickets",
    transaction_desc: str = "TickPick",
) -> None:
    """Initiate an STK push, update the checkout ID on the payment record, then poll.

    Args:
        db: Database session.
        payment_id: Payment primary key.
        user_id: User primary key.
        user_full_name: Used for logging.
        phone_number: Customer's M-Pesa phone number.
        amount: Amount in KES.
        mpesa_service: Initialised MpesaService instance.
        account_reference: M-Pesa account reference (max 12 chars).
        transaction_desc: M-Pesa transaction description (max 13 chars).
    """
    logger.info("Initiating STK push for user: %s, amount: %d", user_full_name, amount)

    payment_request = await mpesa_service.initiate_stk_push(
        db=db,
        payment_id=payment_id,
        phone_number=phone_number,
        amount=amount,
        account_reference=account_reference,
        transaction_desc=transaction_desc,
    )

    logger.info("Updating payment record with CheckoutRequestID for user: %s", user_full_name)
    await PaymentRepository.update_field(
        db, payment_id, "mpesa_checkout_id", payment_request.CheckoutRequestID
    )

    await _poll_payment_status(db, user_id, user_full_name, payment_id)


async def _send_ticket_email(
    email: str,
    ticket_id: str,
    qr_token: str,
    ticket_type: TicketType,
    qr_service: QRService,
) -> None:
    """Generate a QR code and dispatch the ticket email.

    Args:
        email: Recipient e-mail address.
        qr_token: Raw QR token stored on the ticket.
        ticket_type: Ticket tier (REGULAR / VIP / GROUP).
        qr_service: Initialised QRService instance.
    """
    qr_image = qr_service.generate_qr_base64(qr_token)
    await email_service.send_ticket_email(
        to=email,
        ticket_id=ticket_id,
        qr_code_b64=qr_image,
        ticket_type=ticket_type
        )


async def _handle_existing_user(
    db: Session,
    user,
    ticket_purchase: TicketPurchase,
    mpesa_service: MpesaService,
    ticket_service: TicketService,
    qr_service: QRService,
) -> dict | None:
    """Handle the purchase flow for a user that already exists in the system.

    Returns a ``TicketRead``-compatible dict when the ticket is immediately ready
    (completed payment), or ``None`` to signal the caller should continue to the
    shared ticket-generation block (payment just completed on a retry path).

    Args:
        db: Database session.
        user: ORM user instance.
        ticket_purchase: Validated request body.
        mpesa_service: Initialised MpesaService instance.
        ticket_service: Initialised TicketService instance.
        qr_service: Initialised QRService instance.

    Raises:
        HTTPException: For still-pending payments or unrecoverable failures.
    """
    payment = await PaymentRepository.get_by_user_id(db, user.id)

    if payment and payment.status == PaymentStatus.COMPLETED:
        logger.info("Payment already completed for user: %s", user.full_name)

        ticket = user.ticket
        if not ticket:
            logger.info("No existing ticket for user: %s — generating now.", user.full_name)
            ticket = await ticket_service.create_ticket(db, user.id, ticket_purchase.ticket_type)

        await _send_ticket_email(user.email, ticket.id, ticket.qr_token, ticket.ticket_type, qr_service)

        return {
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "qr_image": qr_service.generate_qr_base64(ticket.qr_token),
            "ticket_type": ticket.ticket_type,
        }

    if payment and payment.status == PaymentStatus.FAILED:
        logger.warning(
            "Previous payment failed for user: %s — re-initiating STK push.", user.full_name
        )
        amount = TICKET_PRICES.get(ticket_purchase.ticket_type, 0)

        # Change Status to PENDING again before retrying.
        await PaymentRepository.update_status(db, payment.id, PaymentStatus.PENDING)

        await _initiate_and_poll(
            db=db,
            payment_id=payment.id,
            user_id=user.id,
            user_full_name=user.full_name,
            phone_number=ticket_purchase.phone_number,
            amount=amount,
            mpesa_service=mpesa_service,
            account_reference="Tickets",
            transaction_desc="TickPickRetry",
        )

        payment = await PaymentRepository.get_by_user_id(db, user.id)

        if payment and payment.status == PaymentStatus.FAILED:
            logger.error("Retry payment failed for user: %s", user.full_name)
            raise HTTPException(status_code=400, detail="Payment failed again. Please try later.")

        # TODO
        if payment and payment.status == PaymentStatus.PENDING:
            logger.warning("Retry payment still pending for user: %s", user.full_name)
            mpesa_query = await mpesa_service.query_stk_status(payment.mpesa_checkout_id)

            if mpesa_query.is_successful():
                logger.info("STK status query indicates payment completed for user: %s", user.full_name)
                await PaymentRepository.update_status(db, payment.id, PaymentStatus.COMPLETED)
            else:
                logger.warning("STK status query indicates payment failed")
                await PaymentRepository.update_status(db, payment.id, PaymentStatus.FAILED)

            raise HTTPException(
                status_code=202, detail="Payment still pending; please try again shortly."
            )

        # Payment completed — signal caller to generate the ticket
        return None

    # No payment record at all — fall through to ticket generation
    return None


async def _handle_new_user(
    db: Session,
    ticket_purchase: TicketPurchase,
    user_service: UserService,
    mpesa_service: MpesaService,
):
    """Create a new user and payment record, initiate STK push, and poll for completion.

    Returns the created user ORM instance on success.

    Args:
        db: Database session.
        ticket_purchase: Validated request body.
        user_service: Initialised UserService instance.
        mpesa_service: Initialised MpesaService instance.

    Raises:
        HTTPException: If payment is still pending or has failed after all polling attempts.
    """
    logger.info(
        "Creating new user with phone number: %s (len=%d, type=%s)",
        ticket_purchase.phone_number,
        len(ticket_purchase.phone_number),
        type(ticket_purchase.phone_number),
    )

    user = await user_service.create_user({
        "full_name": ticket_purchase.full_name,
        "phone_number": ticket_purchase.phone_number,
        "email": ticket_purchase.email,
    })

    amount = TICKET_PRICES.get(ticket_purchase.ticket_type, 0)

    payment = await PaymentRepository.create(db, {
        "user_id": user.id,
        "amount": amount,
        "status": PaymentStatus.PENDING.value,
    })

    await _initiate_and_poll(
        db=db,
        payment_id=payment.id,
        user_id=user.id,
        user_full_name=user.full_name,
        phone_number=ticket_purchase.phone_number,
        amount=amount,
        mpesa_service=mpesa_service,
    )

    payment = await PaymentRepository.get_by_user_id(db, user.id)

    # Query status from M-Pesa directly if still pending after retries, to minimize false negatives before giving up.
    if payment and payment.status == PaymentStatus.PENDING:
        logger.warning("Payment still pending after retries for user: %s", user.full_name)
        mpesa_query = await mpesa_service.query_stk_status(payment.mpesa_checkout_id)

        if mpesa_query.is_successful():
            logger.info("STK status query indicates payment completed for user: %s", user.full_name)
            await PaymentRepository.update_status(db, payment.id, PaymentStatus.COMPLETED)
        else:
            logger.warning("STK status query indicates payment failed for user: %s", user.full_name)
            await PaymentRepository.update_status(db, payment.id, PaymentStatus.FAILED)

    if payment and payment.status == PaymentStatus.FAILED:
        logger.error("Payment failed for user: %s after retries", user.full_name)
        raise HTTPException(status_code=400, detail="Payment failed. Please try again.")

    return user


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@ticket_router.post("/buy-ticket", response_model=TicketRead)
async def buy_ticket(ticket_purchase: TicketPurchase, db: Session = Depends(get_db)):
    """Handle a ticket purchase request end-to-end."""
    logger.info(
        "Received ticket purchase request for phone number: %s",
        ticket_purchase.phone_number,
    )

    user_service = UserService(db)
    ticket_service = TicketService()
    mpesa_service = MpesaService()
    qr_service = QRService()

    user = await user_service.get_user_by_phone(ticket_purchase.phone_number)

    if user and user.email != ticket_purchase.email:
        logger.error("Email mismatch for user: %s", user.full_name)
        raise HTTPException(status_code=400, detail="Email does not match the existing user.")

    if user:
        result = await _handle_existing_user(
            db, user, ticket_purchase, mpesa_service, ticket_service, qr_service
        )
        if result is not None:
            # Ticket already existed or was re-sent — return immediately
            return result
        # result is None → payment just completed on a retry; generate a fresh ticket below
    else:
        user = await _handle_new_user(db, ticket_purchase, user_service, mpesa_service)

    # Reached only when payment has just become COMPLETED (new user or successful retry)
    ticket = await ticket_service.create_ticket(db, user.id, ticket_purchase.ticket_type)
    qr_code = qr_service.generate_qr_base64(ticket.qr_token)

    logger.info(
        "Ticket generated for user: %s, ticket type: %s",
        user.full_name,
        ticket.ticket_type,
    )
    return {
        "full_name": user.full_name,
        "phone_number": user.phone_number,
        "qr_image": qr_code,
        "ticket_type": ticket.ticket_type,
    }


@ticket_router.post("/send-ticket")
async def send_ticket(body: SendTicketRequest, db: Session = Depends(get_db)):
    """Resend a ticket to the user's registered email address.

    Only succeeds if the user exists and has a completed payment.

    Args:
        body: Request body containing the user's email.
        db: Database session.
    """
    user_service = UserService(db)
    ticket_service = TicketService()
    qr_service = QRService()

    user = await user_service.get_user_by_email(body.email)
    if not user:
        raise HTTPException(status_code=404, detail="No user found with that email address.")

    payment = await PaymentRepository.get_by_user_id(db, user.id)
    if not payment or payment.status != PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail="No completed payment found for this user. Please purchase a ticket first.",
        )

    ticket = user.ticket
    if not ticket:
        logger.info("No ticket on record for user: %s — generating now.", user.full_name)

        for key, value in TICKET_PRICES.items():
            if value == payment.amount:
                ticket_type = key
                break

        if not ticket_type:
            logger.error("No matching ticket type for payment amount: %s", payment.amount)
            raise HTTPException(status_code=400, detail="Invalid payment amount; cannot determine ticket type.")

        ticket = await ticket_service.create_ticket(db, user.id, ticket_type)

    await _send_ticket_email(user.email, ticket.id, ticket.qr_token, ticket.ticket_type, qr_service)
    logger.info("Ticket email dispatched for user: %s", user.full_name)

    return {"message": f"Ticket sent successfully to {user.email}."}


@ticket_router.post("/callback/confirmation")
async def confirmation(
    request: Request,
    db: Session = Depends(get_db),
):
    """Handle M-Pesa STK Push payment confirmation callbacks."""
    client_ip = request.client.host
    logger.info("Received M-Pesa callback from IP: %s", client_ip)

    if not is_mpesa_ip_allowed(client_ip):
        logger.warning("IP not allowed: %s", client_ip)
        raise HTTPException(status_code=403, detail="IP not allowed")

    payload = await request.json()
    callback = StkPushSimulateCallback.model_validate(payload)
    checkout_id = callback.Body.stkCallback.CheckoutRequestID

    # FIX: fetch payment first, then update using its primary key — not the raw checkout ID string
    payment = await PaymentRepository.get_by_checkout_id(db, checkout_id)
    if not payment:
        logger.warning("No payment record found for CheckoutRequestID: %s", checkout_id)
        return StkPushSimulateCallbackResponse().model_dump()

    if callback.is_successful:
        logger.info("Payment successful callback for CheckoutRequestID: %s", checkout_id)
        await PaymentRepository.update_status(db, payment.id, PaymentStatus.COMPLETED)
        logger.info("Payment COMPLETED for payment ID: %s", payment.id)
    else:
        logger.error("Payment failed callback for CheckoutRequestID: %s", checkout_id)
        await PaymentRepository.update_status(db, payment.id, PaymentStatus.FAILED)
        logger.info("Payment FAILED for payment ID: %s", payment.id)

    logger.info(
        "Callback processed for payment id: %s, final status: %s",
        payment.id,
        payment.status,
    )
    return StkPushSimulateCallbackResponse().model_dump()
