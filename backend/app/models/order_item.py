from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class OrderItem(Base):
    __tablename__ = 'order_items'

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'))
    menu_item_id = Column(Integer, ForeignKey('menu_items.id'))
    quantity = Column(Integer, default=1)

    order = relationship('Order', back_populates='items')
    menu_item = relationship('MenuItem')
