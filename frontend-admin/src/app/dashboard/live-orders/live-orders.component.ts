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

  constructor(private orderService: OrderService) {}

  async ngOnInit() {
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

  async switchTab(tab: 'live' | 'completed') {
    this.activeTab = tab;
    await this.refreshData();
  }

  async loadOrders() {
    this.orders = await this.orderService.getActiveOrders();
  }

  async changeStatus(orderId: number, status: string) {
    await this.orderService.updateStatus(orderId, status);
    await this.refreshData();
  }
}