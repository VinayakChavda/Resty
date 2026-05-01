from pydantic import BaseModel
from typing import List,Optional

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int
    notes: Optional[str] = None

class OrderCreate(BaseModel):
    restaurant_id: int
    table_number: str
    items: List[OrderItemCreate]