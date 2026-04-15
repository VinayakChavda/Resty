import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = `${environment.backendUrl}/tables`;
  

  private get authHeader() {
    return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
  }

  async getTables() {
    const res = await axios.get(this.apiUrl, this.authHeader);
    return res.data;
  }

  async addTable(tableNumber: string) {
    const res = await axios.post(`${this.apiUrl}/?table_number=${tableNumber}`, {}, this.authHeader);
    return res.data;
  }

  async deleteTable(id: number) {
    await axios.delete(`${this.apiUrl}/${id}`, this.authHeader);
  }
}