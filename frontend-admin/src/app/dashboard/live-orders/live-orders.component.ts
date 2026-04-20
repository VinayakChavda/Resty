import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-live-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-orders.component.html'
})
export class LiveOrdersComponent implements OnInit {
  orders: any[] = [];
  completedOrders: any[] = []; // History
  activeTab: 'live' | 'completed' = 'live'; // Tab state
  loadingMap: { [key: number]: boolean } = {};
  acknowledgedItemIds: Set<number> = new Set();

  constructor(private orderService: OrderService) { }

  async ngOnInit() {
    const saved = localStorage.getItem('acknowledged_items');
    if (saved) {
      this.acknowledgedItemIds = new Set(JSON.parse(saved));
    }
    await this.refreshData();

    // Global Event Listener (WebSocket se refresh karne ke liye)
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

  isNewItem(orderItemId: number): boolean {
    return !this.acknowledgedItemIds.has(orderItemId);
  }

  acknowledgeItem(orderItemId: number) {
    this.acknowledgedItemIds.add(orderItemId);
    // Save to local storage so it persists until session ends
    localStorage.setItem('acknowledged_items', JSON.stringify(Array.from(this.acknowledgedItemIds)));
  }

  getNewItems(order: any) {
    return order.items.filter((i: any) => this.isNewItem(i.id));
  }

  getConfirmedItems(order: any) {
    return order.items.filter((i: any) => !this.isNewItem(i.id));
  }

  async switchTab(tab: 'live' | 'completed') {
    this.activeTab = tab;
    await this.refreshData();
  }

  async loadOrders() {
    this.orders = await this.orderService.getActiveOrders();
  }

  async changeStatus(orderId: number, status: string) {
    this.loadingMap[orderId] = true; // 👈 start loading for this order

    try {
      await this.orderService.updateStatus(orderId, status);
      await this.refreshData();
    } finally {
      this.loadingMap[orderId] = false; // 👈 stop loading
    }
  }
}