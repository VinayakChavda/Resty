from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.order_service import OrderService
from ..repositories.order_repository import OrderRepository
from ..auth.utils import get_current_user
from ..websocket_manager import manager 

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
async def update_status(order_id: int, status: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = OrderRepository(db)
    updated_order = repo.update_order_status(order_id, status, user['restaurant_id'])
    
    if not updated_order:
        raise HTTPException(status_code=404, detail="Order not found")

    await manager.send_notification(user['restaurant_id'], {
        "event": "STATUS_UPDATE",
        "table_number": updated_order.table_number,
        "status": status
    })
    
    return updated_order

@router.get("/completed")
def get_completed_orders(db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = OrderRepository(db)
    return repo.get_completed_orders(user['restaurant_id'])

@router.post("/{order_id}/add-item")
async def admin_add_item(
    order_id: int, 
    menu_item_id: int, 
    quantity: int = 1, 
    db: Session = Depends(get_db), 
    user = Depends(get_current_user)
):
    repo = OrderRepository(db)
    
    # 1. Fetch item to get its price
    from ..models.menu_item import MenuItem
    item = db.query(MenuItem).filter(MenuItem.id == menu_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # 2. Add to Existing Order logic (We already wrote this in the repo)
    new_items = [{"menu_item_id": menu_item_id, "quantity": quantity}]
    updated_order = repo.add_items_to_existing_order(order_id, new_items)

    # 3. Notify Customer Phone via WebSocket (So their bill updates instantly)
    from ..websocket_manager import manager
    await manager.send_notification(user['restaurant_id'], {
        "event": "STATUS_UPDATE", # This triggers a refresh on customer phone
        "table_number": updated_order.table_number,
        "status": updated_order.status
    })

    return {"status": "success", "total_price": updated_order.total_price}