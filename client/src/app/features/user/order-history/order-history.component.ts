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
import { Order } from '../../../core/models/order.model';
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

  statusColors: Record<string, string> = {
    PENDING: '#ff9800',
    CONFIRMED: '#2196f3',
    PREPARING: '#9c27b0',
    READY: '#4caf50',
    DELIVERED: '#388e3c',
    CANCELLED: '#f44336',
  };

  statusIcons: Record<string, string> = {
    PENDING: 'hourglass_empty',
    CONFIRMED: 'check_circle_outline',
    PREPARING: 'restaurant',
    READY: 'done_all',
    DELIVERED: 'local_shipping',
    CANCELLED: 'cancel',
  };

  constructor(
    private orderService: OrderService,
    private auth: AuthService,
    private notify: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // GET /order/getByEmployee/{employeeId}
    const user = this.auth.currentUser();
    const employeeId = user?.employeeId ?? String(user?.id ?? '');
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
    this.expandedOrderId.set(
      this.expandedOrderId() === orderId ? null : orderId
    );
  }

  openFeedback(order: Order): void {
    const ref = this.dialog.open(FeedbackDialogComponent, {
      data: { order },
      width: '420px',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        // POST /feedback/create
        this.orderService.createFeedback({
          orderId: order.id,
          rating: result.rating,
          comment: result.comment,
        }).subscribe({
          next: () => {
            this.notify.success('Thank you for your feedback!');
          },
          error: () => this.notify.error('Failed to submit feedback.'),
        });
      }
    });
  }
}
