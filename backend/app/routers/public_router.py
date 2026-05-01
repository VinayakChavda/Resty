from sqlalchemy.orm import joinedload
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.restaurant import Restaurant # Import Restaurant model
from ..models.menu_category import MenuCategory
from ..models.menu_item import MenuItem
from ..schemas.order import OrderCreate
from ..repositories.order_repository import OrderRepository
from ..websocket_manager import manager
from ..models.menu_subcategory import MenuSubCategory

router = APIRouter(prefix="/public", tags=["Customer View"])

@router.post("/place-order")
async def place_customer_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    repo = OrderRepository(db)
    
    order_dict = {
        "restaurant_id": order_in.restaurant_id,
        "table_number": order_in.table_number,
        "items": [item.model_dump() for item in order_in.items] # model_dump() automatically includes 'notes'
    }
    
    # Pehle check karo session active hai ya nahi (Order Merge logic)
    existing_order = repo.get_active_order_by_table(order_in.restaurant_id, order_in.table_number)
    
    if existing_order:
        new_order = repo.add_items_to_existing_order(existing_order.id, order_dict['items'])
    else:
        new_order = repo.place_order(order_dict)

    await manager.send_notification(new_order.restaurant_id, {
        "event": "NEW_ORDER",
        "order_id": new_order.id,
        "table_number": new_order.table_number,
        "total_price": new_order.total_price
    })
    
    return {"status": "success", "order_id": new_order.id}

@router.get("/menu/{restaurant_id}")
def get_public_menu(restaurant_id: int, db: Session = Depends(get_db)):
    # 1. Fetch Restaurant
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    
    # 2. Fetch Nested Data: Category -> SubCategories -> Items
    # joinedload use karne se ek hi query mein saara data aa jayega
    categories = db.query(MenuCategory).options(
        joinedload(MenuCategory.subcategories).joinedload(MenuSubCategory.items)
    ).filter(MenuCategory.restaurant_id == restaurant_id).all()

    menu_list = []
    for cat in categories:
        sub_list = []
        for sub in cat.subcategories:
            # Sirf wahi items jo delete nahi hue hain
            active_items = [i for i in sub.items if not getattr(i, 'is_deleted', False)]
            
            if active_items:
                sub_list.append({
                    "sub_name": sub.name,
                    "items": active_items
                })
        
        if sub_list:
            menu_list.append({
                "cat_name": cat.name,
                "cat_desc": cat.description,
                "subcategories": sub_list
            })

    return {
        "restaurant_info": {"name": restaurant.name, "address": restaurant.address},
        "menu": menu_list
    }

@router.get("/active-order/{restaurant_id}/{table_number}")
def check_active_order(restaurant_id: int, table_number: str, db: Session = Depends(get_db)):
    repo = OrderRepository(db)
    order = repo.get_active_order_by_table(restaurant_id, table_number)
    if not order:
        return None # Table is free
    
    # Return order with items for the "Bill" view
    return order 


@router.post("/call-service")
async def call_service(data: dict):
    # Broadcast to Admin Dashboard via WebSocket
    await manager.send_notification(data['restaurant_id'], {
        "event": "WAITER_CALL",
        "table_number": data['table_number'],
        "type": data['type']
    })
    return {"status": "success"}