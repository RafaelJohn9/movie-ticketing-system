"""M-Pesa Service for handling STK Push and payment processing."""

from mpesakit import MpesaClient
from mpesakit.errors import MpesaApiException
from mpesakit.mpesa_express import StkPushSimulateResponse, StkPushQueryResponse, TransactionType
from sqlalchemy.orm import Session

from app.repositories.payment_repository import PaymentRepository
from app.settings import settings
from app.utils.enums import PaymentStatus


class MpesaService:
    """Service for M-Pesa STK Push and payment processing."""

    def __init__(self):
        """Initialize M-Pesa client with credentials."""
        self.client = MpesaClient(
            consumer_key=settings.mpesa_consumer_key,
            consumer_secret=settings.mpesa_consumer_secret,
            environment=settings.mpesa_environment
        )
        self.business_short_code = settings.mpesa_shortcode
        self.passkey = settings.mpesa_passkey
        self.callback_url = settings.mpesa_callback_url

    async def initiate_stk_push(
        self,
        db: Session,
        payment_id: str,
        phone_number: str,
        amount: int,
        account_reference: str,
        transaction_desc: str,
    ) -> StkPushSimulateResponse:
        """Initiate STK Push for M-Pesa payment.

        Args:
            db: Database session
            payment_id: Payment record ID
            phone_number: Customer's M-Pesa phone number
            amount: Transaction amount in KES
            account_reference: Transaction identifier (max 12 chars)
            transaction_desc: Transaction description (max 13 chars)

        Returns:
            Response dict with MerchantRequestID and CheckoutRequestID
        """
        try:
            response = self.client.stk_push(
                business_short_code=self.business_short_code,
                passkey=self.passkey,
                transaction_type=TransactionType.CUSTOMER_PAYBILL_ONLINE,
                amount=amount,
                party_a=phone_number,
                party_b=self.business_short_code,
                phone_number=phone_number,
                callback_url=self.callback_url,
                account_reference=account_reference,
                transaction_desc=transaction_desc,
            )

            return response

        except MpesaApiException as e:
            await PaymentRepository.update_status(db, payment_id, PaymentStatus.FAILED)
            raise e
        except Exception as exc:
            await PaymentRepository.update_status(db, payment_id, PaymentStatus.FAILED)
            raise Exception(f"Unexpected error: {str(exc)}")

    async def process_webhook(self, db: Session, callback_data: dict) -> None:
        """Process M-Pesa webhook callback.

        Args:
            db: Database session
            callback_data: Webhook payload from M-Pesa
        """
        try:
            checkout_id = callback_data.get("Body", {}).get("stkCallback", {}).get("CheckoutRequestID")
            result_code = callback_data.get("Body", {}).get("stkCallback", {}).get("ResultCode")

            if not checkout_id:
                return

            # FIX: look up the payment by checkout ID first, then update by its actual primary key
            payment = await PaymentRepository.get_by_checkout_id(db, checkout_id)
            if not payment:
                return

            if result_code == 0:
                await PaymentRepository.update_status(db, payment.id, PaymentStatus.COMPLETED)
            else:
                await PaymentRepository.update_status(db, payment.id, PaymentStatus.FAILED)

        except Exception as exc:
            print(f"Error processing webhook: {str(exc)}")

    async def query_stk_status(
        self,
        checkout_request_id: str,
    ) -> StkPushQueryResponse:
        """Query the status of an STK Push transaction.

        Args:
            checkout_request_id: The CheckoutRequestID returned when the STK Push was initiated.

        Returns:
            Response dict with transaction status details.
        """
        try:
            response = self.client.stk_query(
                business_short_code=self.business_short_code,
                checkout_request_id=checkout_request_id,
                passkey=self.passkey,
            )

            return response

        except MpesaApiException as e:
            return {"error": str(e)}
        except Exception as exc:
            return {"error": f"Unexpected error: {str(exc)}"}