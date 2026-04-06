from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class RestaurantUser(Base):
    __tablename__ = 'restaurant_users'

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'), nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(String, default='admin')

    restaurant = relationship('Restaurant')
