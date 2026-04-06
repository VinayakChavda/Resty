from sqlalchemy.orm import Session
from ..models.menu_category import MenuCategory
from ..models.menu_subcategory import MenuSubCategory
from ..models.menu_item import MenuItem
from .base import BaseRepository

class MenuRepository(BaseRepository):
    # Categories
    def create_category(self, name: str, desc: str, restaurant_id: int):
        db_cat = MenuCategory(name=name, description=desc, restaurant_id=restaurant_id)
        self.db.add(db_cat)
        self.db.commit()
        self.db.refresh(db_cat)
        return db_cat

    def get_categories(self, restaurant_id: int):
        return self.db.query(MenuCategory).filter(MenuCategory.restaurant_id == restaurant_id).all()

    # SubCategories
    def create_subcategory(self, name: str, desc: str, cat_id: int, restaurant_id: int):
        db_sub = MenuSubCategory(name=name, description=desc, category_id=cat_id, restaurant_id=restaurant_id)
        self.db.add(db_sub)
        self.db.commit()
        self.db.refresh(db_sub)
        return db_sub

    # Items
    def create_item(self, item_data: dict, restaurant_id: int):
        db_item = MenuItem(**item_data, restaurant_id=restaurant_id)
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def get_items_by_restaurant(self, restaurant_id: int):
        return self.db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant_id).all()

    def delete_category(self, cat_id: int, restaurant_id: int):
        db_cat = self.db.query(MenuCategory).filter(
            MenuCategory.id == cat_id, 
            MenuCategory.restaurant_id == restaurant_id
        ).first()
        if db_cat:
            self.db.delete(db_cat)
            self.db.commit()
            return True
        return False

    # ... existing methods

    def update_item(self, item_id: int, item_data: dict, restaurant_id: int):
        db_item = self.db.query(MenuItem).filter(MenuItem.id == item_id, MenuItem.restaurant_id == restaurant_id).first()
        if db_item:
            for key, value in item_data.items():
                setattr(db_item, key, value)
            self.db.commit()
            self.db.refresh(db_item)
            return db_item
        return None

    def delete_item(self, item_id: int, restaurant_id: int):
        db_item = self.db.query(MenuItem).filter(MenuItem.id == item_id, MenuItem.restaurant_id == restaurant_id).first()
        if db_item:
            self.db.delete(db_item)
            self.db.commit()
            return True
        return False
    