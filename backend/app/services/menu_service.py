from ..repositories.menu_repository import MenuRepository
from ..models.menu_subcategory import MenuSubCategory

class MenuService:
    def __init__(self, repo: MenuRepository):
        self.repo = repo

    def add_new_category(self, name: str, desc: str, restaurant_id: int):
        # Business Logic: Check if category name already exists for this restaurant
        category = self.repo.create_category(name, desc, restaurant_id)
        
        # 2. IMPORTANT: Isi Category ID ke saath ek Default SubCategory banao
        # Taaki foreign key violation na ho
        default_sub = MenuSubCategory(
            name="General", 
            category_id=category.id, 
            restaurant_id=restaurant_id
        )
        self.repo.db.add(default_sub)
        self.repo.db.commit()
        
        return category

    def fetch_all_categories(self, restaurant_id: int):
        return self.repo.get_categories(restaurant_id)

    def add_subcategory(self, name: str, desc: str, cat_id: int, restaurant_id: int):
        return self.repo.create_subcategory(name, desc, cat_id, restaurant_id)

    def add_menu_item(self, item_data: dict, restaurant_id: int):
        if not item_data.get('subcategory_id') and item_data.get('category_id'):
            cat_id = item_data['category_id']
            # Check if "General" subcategory exists for this category
            sub = self.repo.db.query(MenuSubCategory).filter(
                MenuSubCategory.category_id == cat_id, 
                MenuSubCategory.name == "General"
            ).first()
            
            if not sub:
                sub = MenuSubCategory(name="General", category_id=cat_id, restaurant_id=restaurant_id)
                self.repo.db.add(sub)
                self.repo.db.commit()
                self.repo.db.refresh(sub)
            
            item_data['subcategory_id'] = sub.id
        
        # Category_id item model mein nahi hai, toh remove kardo insert se pehle
        if 'category_id' in item_data: del item_data['category_id']
            
        return self.repo.create_item(item_data, restaurant_id)
    
    def remove_category(self, cat_id: int, restaurant_id: int):
        return self.repo.delete_category(cat_id, restaurant_id)
    
    def fetch_all_items(self, restaurant_id: int):
        return self.repo.get_items_by_restaurant(restaurant_id)
    
    def add_subcategory(self, name: str, category_id: int, restaurant_id: int):
        db_sub = MenuSubCategory(name=name, category_id=category_id, restaurant_id=restaurant_id)
        self.repo.db.add(db_sub)
        self.repo.db.commit()
        self.repo.db.refresh(db_sub)
        return db_sub
    
    def update_menu_item(self, item_id: int, item_data: dict, restaurant_id: int):
    # Agar subcategory_id nahi hai, toh "General" wala logic chalao
        if not item_data.get('subcategory_id') and item_data.get('category_id'):
            cat_id = item_data['category_id']
            sub = self.repo.db.query(MenuSubCategory).filter(
                MenuSubCategory.category_id == cat_id, 
                MenuSubCategory.name == "General"
            ).first()
            
            if not sub:
                # General subcategory banao agar nahi hai
                sub = MenuSubCategory(name="General", category_id=cat_id, restaurant_id=restaurant_id)
                self.repo.db.add(sub)
                self.repo.db.commit()
                self.repo.db.refresh(sub)
            
            item_data['subcategory_id'] = sub.id

        # model_dump() mein category_id extra ho sakta hai, use remove kardo query se pehle
        if 'category_id' in item_data: del item_data['category_id']
        
        return self.repo.update_item(item_id, item_data, restaurant_id)

    def remove_menu_item(self, item_id: int, restaurant_id: int):
        return self.repo.delete_item(item_id, restaurant_id)