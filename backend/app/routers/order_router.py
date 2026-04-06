from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.order_service import OrderService
from ..repositories.order_repository import OrderRepository
from ..auth.utils import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/")
def create_order(table_number: int, db: Session = Depends(get_db)):
    repo = OrderRepository(db)
    service = OrderService(repo)
    order = service.place_new_order(table_number)
    return {
        "order_id": order.id,
        "restaurant_id": order.restaurant_id,
        "table_number": order.table_number,
        "status": order.status
    }

@router.get("/active")
def get_active_orders(db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = OrderRepository(db)
    return repo.get_active_orders(user['restaurant_id'])

@router.patch("/{order_id}/status")
def update_status(order_id: int, status: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = OrderRepository(db)
    updated = repo.update_order_status(order_id, status, user['restaurant_id'])
    if not updated: raise HTTPException(status_code=404)
    return updated

@router.get("/completed")
def get_completed_orders(db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = OrderRepository(db)
    return repo.get_completed_orders(user['restaurant_id'])