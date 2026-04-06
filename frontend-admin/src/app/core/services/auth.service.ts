import { Injectable } from '@angular/core';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import decoding library

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/auth';

  async login(credentials: any) {
    try {
      const response = await axios.post(`${this.apiUrl}/login`, credentials);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      return response.data;
    } catch (error: any) {
      throw error.response.data.detail || 'Login failed';
    }
  }

  getUserEmail(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded.sub || null; // 'sub' hamesha email hota hai
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRestaurantId(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Token decode karo
      const decoded: any = jwtDecode(token);
      // Backend ne token mein 'restaurant_id' bheja tha (paylaod mein)
      return decoded.restaurant_id || null;
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }
}