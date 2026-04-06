import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // FormsModule zaroori hai [(ngModel)] ke liye
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Form fields
  email = '';
  password = '';
  
  // UI states
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    // Basic Validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Bhai, email aur password dono daalo!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.authService.login({
        email: this.email,
        password: this.password
      });

      console.log('Login Successful:', result);
      
      // Success: Token localstorage mein AuthService ne pehle hi daal diya hai
      // Ab hum Dashboard pe bhejenge
      this.router.navigate(['/dashboard']);
      
    } catch (error: any) {
      console.error('Login Error:', error);
      // Backend se jo error message aayega wo dikhayenge
      this.errorMessage = error || 'Login nahi ho pa raha, credentials check karo.';
    } finally {
      this.isLoading = false;
    }
  }
}