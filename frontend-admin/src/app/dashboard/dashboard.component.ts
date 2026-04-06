import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,RouterLink,RouterLinkActive,RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
  private socket!: WebSocket;
  constructor(private router: Router,private toastr: ToastrService,private authService: AuthService) {}

  ngOnInit() {
    this.setupWebSocket();  }

  setupWebSocket() {
    const restaurantId = this.authService.getRestaurantId();
    if (!restaurantId) return;

    // Connect to FastAPI WebSocket
    this.socket = new WebSocket(`ws://127.0.0.1:8000/ws/${restaurantId}`);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'NEW_ORDER') {
        // PLAY SOUND (Optional)
        const audio = new Audio('assets/notification.mp3');
        audio.play();

        // SHOW TOAST
        this.toastr.info(
          `Table ${data.table_number} placed a new order of ₹${data.total_price}`, 
          '🔔 NEW ORDER!',
          { timeOut: 10000, progressBar: true }
        );
        window.dispatchEvent(new Event('refresh-orders'));

        // TODO: Yahan hum orders list ko refresh kar denge
      }
    };

    this.socket.onclose = () => {
      console.log('Socket closed. Retrying in 5s...');
      setTimeout(() => this.setupWebSocket(), 5000);
    };
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
