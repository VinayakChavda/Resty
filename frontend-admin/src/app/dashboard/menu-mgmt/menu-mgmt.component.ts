import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../core/services/menu.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Category, MenuItem, SubCategory } from '../../core/models/menu.model';

@Component({
  selector: 'app-menu-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-mgmt.component.html',
  styleUrl: './menu-mgmt.component.scss'
})
export class MenuMgmtComponent implements OnInit {
  activeTab: 'categories' | 'subcategories' | 'items' = 'categories';
  restaurantId: number | null = null;
  isEditMode = false;
  editingItemId: number | null = null;

  // Data Lists
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  items: MenuItem[] = [];

  // Form Models - Category
  newCatName = '';
  newCatDesc = '';

  // Form Models - SubCategory
  selectedCatForSub: number | null = null;
  newSubName = '';

  // Form Models - Item
  selectedCategory: number | null = null; // Dropdown binding
  newItem = {
    name: '',
    description: '',
    price: 0,
    subcategory_id: null as number | null
  };

  // Delete Modal state
  showDeleteModal = false;
  catIdToDelete: number | null = null;

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  async ngOnInit() {
    this.restaurantId = this.authService.getRestaurantId();
    await this.loadAllData();
  }

  async loadAllData() {
    try {
      this.categories = await this.menuService.getCategories();
      this.items = await this.menuService.getMenuItems();
    } catch (e) {
      console.error('Data load error', e);
    }
  }

  // --- CATEGORY METHODS ---
  async onAddCategory() {
    if (!this.newCatName) return;
    try {
      await this.menuService.addCategory({
        name: this.newCatName,
        description: this.newCatDesc
      });
      this.toastr.success('Category saved successfully!');
      this.newCatName = '';
      this.newCatDesc = '';
      await this.loadAllData();
    } catch (e) {
      this.toastr.error('Failed to add category');
    }
  }

  openDeleteModal(id: number) {
    this.catIdToDelete = id;
    this.showDeleteModal = true;
  }

  async confirmDelete() {
    if (this.catIdToDelete) {
      try {
        await this.menuService.deleteCategory(this.catIdToDelete);
        this.toastr.success('Category removed');
        await this.loadAllData();
      } catch (e) {
        this.toastr.error('Error deleting category');
      } finally {
        this.closeModal();
      }
    }
  }

  closeModal() {
    this.showDeleteModal = false;
    this.catIdToDelete = null;
  }

  // --- SUB-CATEGORY METHODS ---
  async onAddSubCategory() {
    if (!this.newSubName || !this.selectedCatForSub) {
      this.toastr.warning('Please select category and enter name');
      return;
    }
    try {
      await this.menuService.addSubCategory(this.newSubName, this.selectedCatForSub);
      this.toastr.success('Sub-category added!');
      this.newSubName = '';
    } catch (e) {
      this.toastr.error('Error adding sub-category');
    }
  }

  // --- ITEM METHODS ---
  async onCategoryChange() {
    if (this.selectedCategory) {
      // Load subcategories for the selected category
      this.subCategories = await this.menuService.getSubCategories(this.selectedCategory);
      this.newItem.subcategory_id = null; // Reset selection
    }
  }

  async onAddItem() {
    if (!this.newItem.name || !this.newItem.price || !this.selectedCategory) {
      this.toastr.warning('Please fill required fields');
      return;
    }

    try {
      // Backend handles "General" fallback if subcategory_id is null
      const payload = {
        ...this.newItem,
        category_id: this.selectedCategory
      };
      await this.menuService.addMenuItem(payload);
      this.toastr.success('Item added to menu!');
      this.resetItemForm();
      await this.loadAllData();
    } catch (e) {
      this.toastr.error('Failed to add item');
    }
  }

  resetItemForm() {
    this.newItem = { name: '', description: '', price: 0, subcategory_id: null };
    this.selectedCategory = null;
    this.subCategories = [];
  }

  async onDeleteItem(id: number) {
    if (confirm('Bhai, pakka delete karna hai?')) {
      try {
        await this.menuService.deleteMenuItem(id);
        this.toastr.success('Item removed from menu');
        await this.loadAllData();
      } catch (e) { this.toastr.error('Delete fail ho gaya'); }
    }
  }

  // Edit Mode On
  onEditItem(item: MenuItem) {
    this.isEditMode = true;
    this.editingItemId = item.id;

    // Form populate karo
    this.newItem = {
      name: item.name,
      description: item.description || '',
      price: item.price,
      subcategory_id: item.subcategory_id
    };

    // Category dropdown set karo (Backend se category_id dhoondna padega agar item mein nahi hai)
    // Simple way: Subcategory logic ko use karke category_id nikal lo
    this.selectedCategory = this.categories.find(c => c.id === item.subcategory_id)?.id || null;
    this.onCategoryChange(); // Load subcategories for this item
  }

  // Cancel Edit
  cancelEdit() {
    this.isEditMode = false;
    this.editingItemId = null;
    this.resetItemForm();
  }

  // Update Submit Logic (Existing onAddItem ko modify karo)
  async onSaveItem() {
    const payload = {
      name: this.newItem.name,
      description: this.newItem.description,
      price: this.newItem.price,
      subcategory_id: this.newItem.subcategory_id, // can be null
      category_id: this.selectedCategory,          // explicitly send this
      is_available: true
    };

    try {
      if (this.isEditMode && this.editingItemId) {
        await this.menuService.updateMenuItem(this.editingItemId, payload);
        this.toastr.success('Update ho gaya!');
      } else {
        await this.menuService.addMenuItem(payload);
        this.toastr.success('Add ho gaya!');
      }
      this.cancelEdit();
      this.loadAllData();
    } catch (error) {
      console.error(error); // Console mein dekho kya error aa raha hai
      this.toastr.error('Kuch gadbad hai boss!');
    }
  }
}