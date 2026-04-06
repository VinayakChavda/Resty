from pydantic import BaseModel
from typing import Optional, List

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    restaurant_id: int
    class Config:
        from_attributes = True

# --- SubCategory Schemas ---
class SubCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: int

class SubCategoryCreate(SubCategoryBase):
    pass

class SubCategoryResponse(SubCategoryBase):
    id: int
    class Config:
        from_attributes = True

# --- MenuItem Schemas ---
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    subcategory_id: Optional[int] = None # <-- Isse Optional kardo
    category_id: Optional[int] = None    # <-- Isse bhi add kardo taaki logic easy ho jaye
    is_available: bool = True

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemResponse(MenuItemBase):
    id: int
    class Config:
        from_attributes = True