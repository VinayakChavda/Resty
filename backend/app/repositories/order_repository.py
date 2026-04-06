from sqlalchemy.orm import Session
from ..models.order import Order
from ..models.order_item import OrderItem
from .base import BaseRepository
from sqlalchemy.orm import joinedload
from ..models.menu_item import MenuItem

class OrderRepository(BaseRepository):
    def create_order(self, table_number: int) -> Order:
        db_order = Order(table_number=table_number, status="pending")
        self.db.add(db_order)
        self.db.commit()
        self.db.refresh(db_order)
        return db_order

    def get_active_orders(self):
        return self.db.query(Order).filter(Order.status != "completed").all()

    def get_by_id(self, order_id: int):
        return self.db.query(Order).filter(Order.id == order_id).first()

    def place_order(self, order_data: dict):
        # 1. Calculate Total Price dynamically from Database
        final_total = 0
        items_with_prices = []

        for item in order_data['items']:
            # Database se item fetch karo uski real price ke liye
            db_menu_item = self.db.query(MenuItem).filter(MenuItem.id == item['menu_item_id']).first()
            
            if db_menu_item:
                item_total = db_menu_item.price * item['quantity']
                final_total += item_total
                # Item info save kar lete hain order_items ke liye
                items_with_prices.append({
                    "menu_item_id": db_menu_item.id,
                    "quantity": item['quantity']
                })

        # 2. Create Main Order Record with calculated total
        db_order = Order(
            restaurant_id=order_data['restaurant_id'],
            table_number=order_data['table_number'],
            status="pending",
            total_price=final_total  # AB YEH REAL TOTAL HAI!
        )
        self.db.add(db_order)
        self.db.flush()  # Order ID generate karne ke liye

        # 3. Add individual Order Items
        for item in items_with_prices:
            db_item = OrderItem(
                order_id=db_order.id,
                menu_item_id=item['menu_item_id'],
                quantity=item['quantity']
            )
            self.db.add(db_item)
        
        self.db.commit()
        self.db.refresh(db_order)
        return db_order

    
    def get_active_orders(self, restaurant_id: int):
        return self.db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.menu_item)
        ).filter(
            Order.restaurant_id == restaurant_id,
            Order.status.in_(['pending', 'preparing', 'served'])
        ).order_by(Order.created_at.desc()).all()

    def update_order_status(self, order_id: int, status: str, restaurant_id: int):
        db_order = self.db.query(Order).filter(Order.id == order_id, Order.restaurant_id == restaurant_id).first()
        if db_order:
            db_order.status = status
            self.db.commit()
            self.db.refresh(db_order)
            return db_order
        return None
    
    def get_completed_orders(self, restaurant_id: int):
        return self.db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.menu_item)
        ).filter(
            Order.restaurant_id == restaurant_id,
            Order.status == 'completed' # Sirf completed wale
        ).order_by(Order.created_at.desc()).all()