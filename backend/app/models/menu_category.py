from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class MenuCategory(Base):
    __tablename__ = 'menu_categories'

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    display_order = Column(Integer, default=0)

    restaurant = relationship('Restaurant')
    subcategories = relationship('MenuSubCategory', back_populates='category', cascade='all, delete-orphan')
