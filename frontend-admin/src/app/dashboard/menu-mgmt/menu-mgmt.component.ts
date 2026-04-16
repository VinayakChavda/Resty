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
  tabs: ('categories' | 'subcategories' | 'items')[] = ['categories', 'subcategories', 'items'];
  activeTab: 'categories' | 'subcategories' | 'items' = 'categories';
  
  showForm = false;
  isInitialLoading = true;
  isSaving = false;
  isDeleting = false;
  isEditMode = false;
  
  restaurantId: number | null = null;
  editingItemId: number | null = null;
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  items: MenuItem[] = [];

  newCatName = '';
  newCatDesc = '';
  selectedCatForSub: number | null = null;
  newSubName = '';
  selectedCategory: number | null = null;
  newItem = { name: '', description: '', price: 0, subcategory_id: null as number | null };

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

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.cancelEdit();
  }

  onTabChange(tab: 'categories' | 'subcategories' | 'items') {
    this.activeTab = tab;
    this.showForm = false;
    this.isEditMode = false;
  }

  async loadAllData() {
    this.isInitialLoading = true;
    try {
      const [cats, menuItems] = await Promise.all([
        this.menuService.getCategories(),
        this.menuService.getMenuItems()
      ]);
      this.categories = cats;
      this.items = menuItems;
    } finally {
      this.isInitialLoading = false;
    }
  }

  async onAddCategory() {
    if (!this.newCatName) return;
    this.isSaving = true;
    try {
      await this.menuService.addCategory({ name: this.newCatName, description: this.newCatDesc });
      this.toastr.success('Category Saved');
      this.newCatName = ''; this.newCatDesc = '';
      this.showForm = false;
      await this.loadAllData();
    } finally { this.isSaving = false; }
  }

  async onAddSubCategory() {
    if (!this.newSubName || !this.selectedCatForSub) return;
    this.isSaving = true;
    try {
      await this.menuService.addSubCategory(this.newSubName, this.selectedCatForSub);
      this.toastr.success('Sub-category Saved');
      this.newSubName = '';
      this.showForm = false;
      await this.loadAllData();
    } finally { this.isSaving = false; }
  }

  async onCategoryChange() {
    if (this.selectedCategory) {
      this.subCategories = await this.menuService.getSubCategories(this.selectedCategory);
    }
  }

  async onSaveItem() {
    if (!this.newItem.name || !this.newItem.price || !this.selectedCategory) return;
    this.isSaving = true;
    const payload = { ...this.newItem, category_id: this.selectedCategory };
    try {
      if (this.isEditMode && this.editingItemId) {
        await this.menuService.updateMenuItem(this.editingItemId, payload);
        this.toastr.success('Updated');
      } else {
        await this.menuService.addMenuItem(payload);
        this.toastr.success('Added');
      }
      this.cancelEdit();
      await this.loadAllData();
    } finally { this.isSaving = false; }
  }

  onEditItem(item: MenuItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.editingItemId = item.id;
    this.newItem = { name: item.name, description: item.description || '', price: item.price, subcategory_id: item.subcategory_id };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async onDeleteItem(id: number) {
    if (!confirm('Are you sure?')) return;
    await this.menuService.deleteMenuItem(id);
    this.toastr.success('Deleted');
    await this.loadAllData();
  }

  cancelEdit() {
    this.isEditMode = false;
    this.showForm = false;
    this.editingItemId = null;
    this.resetItemForm();
  }

  resetItemForm() {
    this.newItem = { name: '', description: '', price: 0, subcategory_id: null };
    this.selectedCategory = null;
  }

  openDeleteModal(id: number) { this.catIdToDelete = id; this.showDeleteModal = true; }
  closeModal() { this.showDeleteModal = false; this.catIdToDelete = null; }
  async confirmDelete() {
    if (!this.catIdToDelete) return;
    this.isDeleting = true;
    try {
      await this.menuService.deleteCategory(this.catIdToDelete);
      this.toastr.success('Removed');
      await this.loadAllData();
      this.closeModal();
    } finally { this.isDeleting = false; }
  }
}