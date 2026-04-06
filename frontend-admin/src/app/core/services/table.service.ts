import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = 'http://127.0.0.1:8000/tables';

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