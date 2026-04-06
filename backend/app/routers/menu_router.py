from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..auth.utils import get_current_user
from ..repositories.menu_repository import MenuRepository
from ..services.menu_service import MenuService
from ..schemas.menu import CategoryCreate, CategoryResponse, MenuItemCreate, MenuItemResponse
from ..models.menu_subcategory import MenuSubCategory

router = APIRouter(prefix="/menu", tags=["Menu Management"])

@router.post("/categories", response_model=CategoryResponse)
def create_category(cat: CategoryCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = MenuRepository(db)
    service = MenuService(repo)
    return service.add_new_category(cat.name, cat.description, user['restaurant_id'])

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = MenuRepository(db)
    service = MenuService(repo)
    return service.fetch_all_categories(user['restaurant_id'])

@router.post("/items", response_model=MenuItemResponse)
def create_item(item: MenuItemCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = MenuRepository(db)
    service = MenuService(repo)
    return service.add_menu_item(item.model_dump(), user['restaurant_id'])

@router.delete("/categories/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = MenuRepository(db)
    service = MenuService(repo)
    success = service.remove_category(cat_id, user['restaurant_id'])
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

@router.get("/items", response_model=List[MenuItemResponse])
def get_items(db: Session = Depends(get_db), user = Depends(get_current_user)):
    repo = MenuRepository(db)
    service = MenuService(repo)
    return service.fetch_all_items(user['restaurant_id'])

@router.get("/subcategories/{category_id}")
def get_subcategories(category_id: int, db: Session = Depends(get_db)):
    return db.query(MenuSubCategory).filter(MenuSubCategory.category_id == category_id).all()

@router.post("/subcategories")
def create_subcategory(name: str, category_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    service = MenuService(MenuRepository(db))
    return service.add_subcategory(name, category_id, user['restaurant_id'])

@router.put("/items/{item_id}", response_model=MenuItemResponse)
def update_item(item_id: int, item: MenuItemCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    service = MenuService(MenuRepository(db))
    updated = service.update_menu_item(item_id, item.model_dump(), user['restaurant_id'])
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated

@router.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    service = MenuService(MenuRepository(db))
    if not service.remove_menu_item(item_id, user['restaurant_id']):
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"} 