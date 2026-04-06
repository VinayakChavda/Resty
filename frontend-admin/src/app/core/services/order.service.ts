import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://127.0.0.1:8000/orders';

  private get authHeader() {
    return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
  }

  async getActiveOrders() {
    const res = await axios.get(`${this.apiUrl}/active`, this.authHeader);
    return res.data;
  }

  async updateStatus(orderId: number, status: string) {
    const res = await axios.patch(`${this.apiUrl}/${orderId}/status?status=${status}`, {}, this.authHeader);
    return res.data;
  }

  async getCompletedOrders() {
    const res = await axios.get(`${this.apiUrl}/completed`, this.authHeader);
    return res.data;
  }
}
