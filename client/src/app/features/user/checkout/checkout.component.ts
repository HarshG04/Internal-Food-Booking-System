import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private auth = inject(AuthService);

  cart = this.cartService.cart;
  paymentMethod = signal<string>('UPI');
  placing = signal(false);

  paymentOptions = [
    { value: 'UPI', label: 'UPI / PhonePe / GPay', icon: 'phone_iphone' },
    { value: 'CARD', label: 'Credit / Debit Card', icon: 'credit_card' },
    { value: 'NETBANKING', label: 'Net Banking', icon: 'account_balance' },
    { value: 'CASH', label: 'Pay at Counter', icon: 'payments' },
  ];

  get gst(): number { return Math.round(this.cart().total * 0.05); }
  get grandTotal(): number { return this.cart().total + this.gst; }

  placeOrder(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.placing.set(true);
    const request = {
      userId,
      items: this.cart().items.map(i => ({
        foodItemId: i.foodItem.id,
        quantity: i.quantity,
      })),
    };

    // POST /api/orders/place — atomic order creation
    this.orderService.placeOrder(request).subscribe({
      next: (order) => {
        this.notify.info('Order placed! Proceeding to payment…');
        this.router.navigate(['/payment', order.id], {
          state: { paymentMethod: this.paymentMethod(), totalAmount: this.grandTotal },
        });
      },
      error: (err) => {
        this.placing.set(false);
        this.notify.error(err.error?.message ?? 'Failed to place order. Try again.');
      },
    });
  }
}
