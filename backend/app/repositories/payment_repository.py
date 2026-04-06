import razorpay
from ..config import settings

class PaymentRepository:
    def __init__(self):
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    def create_razorpay_order(self, amount: int, currency: str = "INR"):
        # Razorpay amount paise mein leta hai (₹1 = 100 paise)
        data = {
            "amount": amount * 100, 
            "currency": currency,
            "payment_capture": 1 # Automatic capture
        }
        return self.client.order.create(data=data)

    def verify_signature(self, data: dict):
        try:
            return self.client.utility.verify_payment_signature(data)
        except:
            return False