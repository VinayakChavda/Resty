from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class MenuItem(Base):
    __tablename__ = 'menu_items'

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'), nullable=False)
    subcategory_id = Column(Integer, ForeignKey('menu_subcategories.id'))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    is_available = Column(Boolean, default=True)
    image_url = Column(String, nullable=True)

    restaurant = relationship('Restaurant')
    subcategory = relationship('MenuSubCategory', back_populates='items')
