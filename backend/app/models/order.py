from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Order(Base):
    __tablename__ = 'orders'

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'), nullable=False)
    table_number = Column(String(50), nullable=False)
    status = Column(String, default='pending')
    total_price = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship('Restaurant')
    items = relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')
