from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class MenuSubCategory(Base):
    __tablename__ = 'menu_subcategories'

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'), nullable=False)
    category_id = Column(Integer, ForeignKey('menu_categories.id'))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    restaurant = relationship('Restaurant')
    category = relationship('MenuCategory', back_populates='subcategories')
    items = relationship('MenuItem', back_populates='subcategory', cascade='all, delete-orphan')
