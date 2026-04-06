from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from ..database import Base

class Restaurant(Base):
    __tablename__ = 'restaurants'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
