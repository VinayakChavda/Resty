import { Injectable } from '@angular/core';
import axios from 'axios';
import { Category, MenuItem } from '../models/menu.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private apiUrl = `${environment.backendUrl}/menu`;
    

    private get authHeader() {
        return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
    }

    async getCategories(): Promise<Category[]> {
        const res = await axios.get(`${this.apiUrl}/categories`, this.authHeader);
        return res.data;
    }

    async addCategory(data: any): Promise<Category> {
        const res = await axios.post(`${this.apiUrl}/categories`, data, this.authHeader);
        return res.data;
    }

    async getMenuItems(): Promise<MenuItem[]> {
        const res = await axios.get(`${this.apiUrl}/items`, this.authHeader);
        return res.data;
    }

    async addMenuItem(data: any): Promise<MenuItem> {
        const res = await axios.post(`${this.apiUrl}/items`, data, this.authHeader);
        return res.data;
    }

    async deleteCategory(id: number): Promise<void> {
        await axios.delete(`${this.apiUrl}/categories/${id}`, this.authHeader);
    }

    async getItems(): Promise<MenuItem[]> {
        const res = await axios.get(`${this.apiUrl}/items`, this.authHeader);
        return res.data;
    }

    async addItem(itemData: any): Promise<MenuItem> {
        const res = await axios.post(`${this.apiUrl}/items`, itemData, this.authHeader);
        return res.data;
    }

    async getSubCategories(catId: number) {
        const res = await axios.get(`${this.apiUrl}/subcategories/${catId}`, this.authHeader);
        return res.data;
    }

    async addSubCategory(name: string, catId: number) {
        const res = await axios.post(`${this.apiUrl}/subcategories?name=${name}&category_id=${catId}`, {}, this.authHeader);
        return res.data;
    }

    async updateMenuItem(id: number, data: any): Promise<MenuItem> {
        const res = await axios.put(`${this.apiUrl}/items/${id}`, data, this.authHeader);
        return res.data;
    }

    async deleteMenuItem(id: number): Promise<void> {
        await axios.delete(`${this.apiUrl}/items/${id}`, this.authHeader);
    }
}
