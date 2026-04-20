from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from ..database import Base

class TableRequest(Base):
    __tablename__ = 'table_requests'

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'), nullable=False)
    table_number = Column(String, nullable=False)
    request_type = Column(String, nullable=False) # 'waiter', 'water', 'bill'
    status = Column(String, default='pending') # 'pending', 'resolved'
    created_at = Column(DateTime, default=datetime.utcnow)