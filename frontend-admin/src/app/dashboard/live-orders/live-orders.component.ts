import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { MenuService } from '../../core/services/menu.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-live-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-orders.component.html'
})
export class LiveOrdersComponent implements OnInit {
  // Data Storage
  orders: any[] = [];
  completedOrders: any[] = [];
  allMenuItems: any[] = [];
  filteredItems: any[] = [];
  
  // UI State
  activeTab: 'live' | 'completed' = 'live';
  loadingMap: { [key: number]: boolean } = {};
  showAddModal = false;
  
  // Search & Session State
  selectedOrderForAdd: any = null;
  searchQuery = '';
  acknowledgedItemIds: Set<number> = new Set();

  constructor(
    private orderService: OrderService, 
    private menuService: MenuService,
    private toastr: ToastrService
  ) { }

  async ngOnInit() {
    // Load acknowledged items from session
    const saved = localStorage.getItem('acknowledged_items');
    if (saved) {
      this.acknowledgedItemIds = new Set(JSON.parse(saved));
    }

    await this.refreshData();
    
    // Cache the full menu for instant search later
    try {
        this.allMenuItems = await this.menuService.getMenuItems();
    } catch (e) {
        console.error('Menu load error', e);
    }

    // Global Event Listener (For real-time WebSocket refresh)
    window.addEventListener('refresh-orders', async () => {
      await this.refreshData();
    });
  }

  async refreshData() {
    if (this.activeTab === 'live') {
      this.orders = await this.orderService.getActiveOrders();
    } else {
      this.completedOrders = await this.orderService.getCompletedOrders();
    }
  }

  async switchTab(tab: 'live' | 'completed') {
    this.activeTab = tab;
    await this.refreshData();
  }

  // --- ITEM STATUS LOGIC (Frontend Only) ---

  isNewItem(orderItemId: number): boolean {
    return !this.acknowledgedItemIds.has(orderItemId);
  }

  acknowledgeItem(orderItemId: number) {
    this.acknowledgedItemIds.add(orderItemId);
    localStorage.setItem('acknowledged_items', JSON.stringify(Array.from(this.acknowledgedItemIds)));
  }

  getNewItems(order: any) {
    return order.items.filter((i: any) => this.isNewItem(i.id));
  }

  getConfirmedItems(order: any) {
    return order.items.filter((i: any) => !this.isNewItem(i.id));
  }

  // --- ADMIN ACTIONS ---

  async changeStatus(orderId: number, status: string) {
    this.loadingMap[orderId] = true;
    try {
      await this.orderService.updateStatus(orderId, status);
      await this.refreshData();
      this.toastr.success(`Order moved to ${status}`);
    } finally {
      this.loadingMap[orderId] = false;
    }
  }

  // --- QUICK ADD MODAL LOGIC ---

  openAddModal(order: any) {
    this.selectedOrderForAdd = order;
    this.showAddModal = true;
    this.searchQuery = '';
    // Show top 6 items by default
    this.filteredItems = this.allMenuItems.slice(0, 6);
  }

  filterItems() {
    if (!this.searchQuery) {
      this.filteredItems = this.allMenuItems.slice(0, 6);
      return;
    }
    this.filteredItems = this.allMenuItems.filter(i =>
      i.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    ).slice(0, 12);
  }

  async quickAdd(menuItemId: number) {
    try {
      await this.orderService.addItemToOrder(this.selectedOrderForAdd.id, menuItemId);
      this.toastr.success('Item added successfully');
      this.showAddModal = false;
      await this.refreshData(); // Triggers re-fetch and updates prices
    } catch (e) {
      this.toastr.error('Failed to add item');
    }
  }
}