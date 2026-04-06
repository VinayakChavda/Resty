import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import { ToastrService } from 'ngx-toastr';

declare var Razorpay: any; // Razorpay ke liye global variable
@Component({
  selector: 'app-public-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class PublicMenuComponent implements OnInit {
  restaurantId!: number;
  tableNumber!: string;
  restaurantInfo: any = null;
  menuData: any[] = [];
  cart: any[] = [];
  loading = true;
  activeCategory = '';
  showCart = false;
  orderLoading = false;

  constructor(private route: ActivatedRoute, private toastr: ToastrService) { }

  async ngOnInit() {
    this.restaurantId = this.route.snapshot.params['rid'];
    this.tableNumber = this.route.snapshot.params['tid'];
    await this.fetchMenu();
  }

  async payAndOrder() {
    const amount = this.cartTotal;

    // 1. Backend se Razorpay Order ID maango
    const res = await axios.post(`http://127.0.0.1:8000/payments/create-order?amount=${amount}`);
    const razorpayOrderId = res.data.id;

    // 2. Razorpay Popup Options
    const options = {
      "key": "rzp_test_SZTbqyxyuu70yc", // Test Key ID
      "amount": amount * 100,
      "currency": "INR",
      "name": this.restaurantInfo.name,
      "description": "Food Order Payment",
      "order_id": razorpayOrderId,
      "handler": (response: any) => {
        // 3. Payment Success hone pe ye chalega
        this.verifyPaymentOnBackend(response);
      },
      "theme": { "color": "#f97316" } // Orange color
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  async verifyPaymentOnBackend(paymentData: any) {
    try {
      const res = await axios.post('http://127.0.0.1:8000/payments/verify', {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature
      });

      if (res.data.status === 'Payment Verified') {
        // 4. Verification ke baad order place karo
        this.confirmAndPlaceOrder();
        alert('Payment Successful! Your order is being prepared.');
      }
    } catch (e) {
      alert('Payment Verification Failed!');
    }
  }

  async confirmAndPlaceOrder() {
    if (this.cart.length === 0) return;

    this.orderLoading = true;

    // Format data for Backend (OrderCreate schema)
    const orderPayload = {
      restaurant_id: Number(this.restaurantId),
      table_number: this.tableNumber,
      items: this.cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const res = await axios.post('http://127.0.0.1:8000/public/place-order', orderPayload);

      if (res.data.status === 'success') {
        this.showCart = false;
        this.cart = []; // Cart khali kardo
        this.toastr.success(`Success! Order ID #${res.data.order_id} is sent to the kitchen.`);
        // TODO: Redirect to a "Thank You" or "Order Tracking" page
      }
    } catch (error) {
      console.error('Order Error:', error);
      this.toastr.error('Something went wrong. Please try again or call staff.');
    } finally {
      this.orderLoading = false;
    }
  }

  async fetchMenu() {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/public/menu/${this.restaurantId}`);
      this.restaurantInfo = res.data.restaurant_info;
      this.menuData = res.data.menu; // Ab ye nested array hai

      if (this.menuData.length > 0) {
        this.activeCategory = this.menuData[0].cat_name;
      }
    } catch (e) {
      console.error('API Error', e);
    } finally {
      this.loading = false;
    }
  }

  // Cart Logic
  getItemQuantity(itemId: number): number {
    const item = this.cart.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  }

  addToCart(item: any) {
    const existing = this.cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
  }

  removeFromCart(item: any) {
    const index = this.cart.findIndex(i => i.id === item.id);
    if (index > -1) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1);
      }
    }
  }

  get cartTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get cartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  scrollToCategory(catName: string) {
    this.activeCategory = catName;
    const el = document.getElementById(catName);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}