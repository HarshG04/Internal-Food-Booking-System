import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, OrderItem } from '../../../core/models/order.model';
import { NotificationService } from '../../../core/services/notification.service';
import { FeedbackDialogComponent } from './feedback-dialog.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
  ],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss',
})
export class OrderHistoryComponent implements OnInit {
  loading = signal(true);
  orders = signal<Order[]>([]);
  expandedOrderId = signal<number | null>(null);
  orderItemsMap = signal<Record<number, OrderItem[]>>({});
  loadingItemsFor = signal<number | null>(null);

  itemStatusColors: Record<string, string> = {
    ORDERED: '#ff9800',
    PREPARED: '#2196f3',
    DELIVERED: '#388e3c',
  };

  constructor(
    private orderService: OrderService,
    private auth: AuthService,
    private notify: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // GET /api/orders/employee/{employeeId}
    const employeeId = this.auth.getUserId();
    if (!employeeId) { this.loading.set(false); return; }

    this.orderService.getMyOrders(employeeId).subscribe({
      next: (orders) => {
        this.orders.set(orders.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Failed to load orders.');
      },
    });
  }

  toggleExpand(orderId: number): void {
    const isExpanding = this.expandedOrderId() !== orderId;
    this.expandedOrderId.set(isExpanding ? orderId : null);

    if (isExpanding && !this.orderItemsMap()[orderId]) {
      this.loadingItemsFor.set(orderId);
      // GET /api/order-items/order/{orderId}
      this.orderService.getOrderItemsByOrder(orderId).subscribe({
        next: (items) => {
          this.orderItemsMap.update(m => ({ ...m, [orderId]: items }));
          this.loadingItemsFor.set(null);
        },
        error: () => this.loadingItemsFor.set(null),
      });
    }
  }

  openFeedback(item: OrderItem): void {
    const ref = this.dialog.open(FeedbackDialogComponent, {
      data: { orderItem: item },
      width: '420px',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        // POST /api/feedbacks
        this.orderService.createFeedback({
          orderItem: { id: item.id },
          rating: result.rating,
          review: result.comment,
          reviewedAt: new Date().toISOString(),
        }).subscribe({
          next: () => this.notify.success('Thank you for your feedback!'),
          error: () => this.notify.error('Failed to submit feedback.'),
        });
      }
    });
  }
}
