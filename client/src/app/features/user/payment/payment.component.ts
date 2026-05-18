import { Component, OnInit, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { switchMap } from 'rxjs';

import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements OnInit {
  readonly orderId = input.required<string>();

  loading = signal(true);
  order = signal<Order | null>(null);
  paymentDone = signal(false);
  processing = signal(false);

  constructor(
    private orderService: OrderService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    // GET /order/get/{id}
    this.orderService.getOrderById(Number(this.orderId())).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
        if (o.paymentStatus === 'PAID') this.paymentDone.set(true);
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

    // Step 1: POST /payment/create
    this.orderService.createPayment({
      orderId: order.id,
      amount: order.totalAmount,
      method: order.paymentMethod,
    }).pipe(
      // Step 2: PUT /payment/updateStatus/{id}  → SUCCESS
      switchMap(payment => this.orderService.updatePaymentStatus(payment.id, 'SUCCESS')),
      // Step 3: POST /order/place  (finalize order after payment)
      switchMap(() => this.orderService.placeOrder({
        restaurantId: order.restaurantId,
        items: [],
        paymentMethod: order.paymentMethod,
      }))
    ).subscribe({
      next: (placed) => {
        this.order.set({ ...order, ...placed, paymentStatus: 'PAID' });
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
