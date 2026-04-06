export interface Category {
  id: number;
  name: string;
  description?: string;
  restaurant_id: number;
}

export interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  description?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  subcategory_id: number;
}