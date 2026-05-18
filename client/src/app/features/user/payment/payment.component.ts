import { Component, OnInit, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { Router } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatRadioModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements OnInit {
  readonly orderId = input.required<string>();

  loading = signal(true);
  order = signal<Order | null>(null);
  paymentDone = signal(false);
  processing = signal(false);
  paymentMethod = signal<string>('UPI');

  paymentOptions = [
    { value: 'UPI', label: 'UPI / PhonePe / GPay', icon: 'phone_iphone' },
    { value: 'CARD', label: 'Credit / Debit Card', icon: 'credit_card' },
    { value: 'NETBANKING', label: 'Net Banking', icon: 'account_balance' },
    { value: 'WALLET', label: 'Wallet', icon: 'account_balance_wallet' },
  ];

  constructor(
    private orderService: OrderService,
    private notify: NotificationService,
    private router: Router,
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { paymentMethod?: string } | undefined;
    if (state?.paymentMethod) {
      this.paymentMethod.set(state.paymentMethod);
    }
  }

  ngOnInit(): void {
    // GET /api/orders/{id}
    this.orderService.getOrderById(Number(this.orderId())).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Could not load order details.');
      },
    });
  }

  processPayment(): void {
    const order = this.order();
    if (!order) return;
    this.processing.set(true);

    const txnId = `TXN${Date.now()}`;
    const now = new Date().toISOString();

    // Step 1: POST /api/payments
    this.orderService.createPayment({
      order: { id: order.id },
      gatewayTxnId: txnId,
      amount: order.totalAmount,
      method: this.paymentMethod(),
      status: 'PENDING',
      paidAt: now,
    }).pipe(
      // Step 2: PATCH /api/payments/{id}/status?status=SUCCESS
      switchMap(payment => this.orderService.updatePaymentStatus(payment.id, 'SUCCESS'))
    ).subscribe({
      next: () => {
        this.paymentDone.set(true);
        this.processing.set(false);
        this.notify.success('Payment successful! Show your token to the vendor.');
      },
      error: () => {
        this.processing.set(false);
        this.notify.error('Payment failed. Please try again.');
      },
    });
  }
}
