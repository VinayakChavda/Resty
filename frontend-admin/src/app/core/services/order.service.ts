import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.backendUrl}/orders`;
  

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
