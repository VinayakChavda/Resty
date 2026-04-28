from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..auth.utils import get_current_user
from ..repositories.menu_repository import MenuRepository
from ..services.menu_service import MenuService
from ..schemas.menu import CategoryCreate, CategoryResponse, MenuItemCreate, MenuItemResponse
from ..models.menu_subcategory import MenuSubCategory
from fastapi import UploadFile, File, Form
from ..services.image_service import upload_to_s3, get_auto_image 

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

@router.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    service = MenuService(MenuRepository(db))
    if not service.remove_menu_item(item_id, user['restaurant_id']):
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"} 


@router.post("/items", response_model=MenuItemResponse)
async def create_item(
    name: str = Form(...),
    price: float = Form(...),
    description: str = Form(None),
    category_id: int = Form(...),
    subcategory_id: int = Form(None),
    image: UploadFile = File(None), # This makes the image optional
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # 1. Decide which image URL to use
    if image:
        # If Admin uploaded a file, send to S3
        image_url = upload_to_s3(image)
    else:
        # If no file, get a beautiful one from Unsplash
        image_url = get_auto_image(name)

    # 2. Prepare data for Repository
    item_dict = {
        "name": name,
        "price": price,
        "description": description,
        "subcategory_id": subcategory_id,
        "category_id": category_id, # Service layer handles "General" logic using this
        "image_url": image_url
    }

    repo = MenuRepository(db)
    service = MenuService(repo)
    # The existing service.add_menu_item logic will work fine
    return service.add_menu_item(item_dict, user['restaurant_id'])

@router.put("/items/{item_id}", response_model=MenuItemResponse)
async def update_item(
    item_id: int,
    name: str = Form(...),
    price: float = Form(...),
    description: str = Form(None),
    category_id: int = Form(...),
    subcategory_id: int = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    from ..services.image_service import upload_to_s3
    item_dict = {"name": name, "price": price, "description": description, "subcategory_id": subcategory_id, "category_id": category_id}
    
    if image:
        item_dict["image_url"] = upload_to_s3(image)

    updated = MenuService(MenuRepository(db)).update_menu_item(item_id, item_dict, user['restaurant_id'])
    if not updated: raise HTTPException(status_code=404, detail="Item not found")
    return updated