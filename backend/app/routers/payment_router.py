from fastapi import APIRouter, Depends, HTTPException
from ..repositories.payment_repository import PaymentRepository

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create-order")
def create_payment(amount: int):
    repo = PaymentRepository()
    return repo.create_razorpay_order(amount)

@router.post("/verify")
def verify_payment(data: dict):
    repo = PaymentRepository()
    if repo.verify_signature(data):
        # Yahan aap database mein order ko 'Paid' mark karoge
        return {"status": "Payment Verified"}
    else:
        raise HTTPException(status_code=400, detail="Invalid Signature")