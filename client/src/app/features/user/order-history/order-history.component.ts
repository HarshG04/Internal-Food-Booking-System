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
import { forkJoin } from 'rxjs';
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
  orderItemsMap = signal<Record<number, OrderItem[]>>({});

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
    const employeeId = this.auth.getUserId();
    if (!employeeId) { this.loading.set(false); return; }

    forkJoin({
      orders: this.orderService.getMyOrders(employeeId),
      items: this.orderService.getOrderItemsByUser(employeeId),
    }).subscribe({
      next: ({ orders, items }) => {
        this.orders.set(orders.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        // Pre-populate the items map grouped by order id
        const map: Record<number, OrderItem[]> = {};
        items.forEach(item => {
          const oid = item.order?.id;
          if (oid != null) {
            if (!map[oid]) map[oid] = [];
            map[oid].push(item);
          }
        });
        this.orderItemsMap.set(map);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Failed to load orders.');
      },
    });
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
