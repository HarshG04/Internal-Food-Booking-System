import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';

import { VendorService } from '../../../core/services/vendor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Order } from '../../../core/models/order.model';

type StatusFilter = 'ALL' | 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
  ],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.scss',
})
export class OrderManagementComponent implements OnInit {
  loading = signal(true);
  orders = signal<Order[]>([]);
  activeFilter = signal<StatusFilter>('ALL');
  updatingId = signal<number | null>(null);

  filters: StatusFilter[] = ['ALL', 'PENDING', 'PREPARING', 'READY', 'DELIVERED'];

  filteredOrders = computed(() => {
    const f = this.activeFilter();
    const all = this.orders();
    return f === 'ALL' ? all : all.filter(o => o.status === f);
  });

  countFor(status: StatusFilter): number {
    if (status === 'ALL') return this.orders().length;
    return this.orders().filter(o => o.status === status).length;
  }

  statusColors: Record<string, string> = {
    PENDING: '#ff9800', CONFIRMED: '#2196f3', PREPARING: '#9c27b0',
    READY: '#4caf50', DELIVERED: '#388e3c', CANCELLED: '#f44336',
  };

  constructor(
    private vendor: VendorService,
    private notify: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    // GET /order/getAll
    this.vendor.getVendorOrders().subscribe({
      next: (orders) => {
        this.orders.set(
          orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  markPrepared(order: Order): void {
    this.updatingId.set(order.id);
    // PUT /orderitem/updateStatus/{id} → PREPARING
    this.vendor.updateOrderItemStatus(order.id, 'PREPARING').subscribe({
      next: () => {
        this.notify.success(`Order #${order.tokenNumber} marked as Preparing`);
        this.orders.update(list =>
          list.map(o => o.id === order.id ? { ...o, status: 'PREPARING' } : o)
        );
        this.updatingId.set(null);
      },
      error: () => {
        this.notify.error('Failed to update order status.');
        this.updatingId.set(null);
      },
    });
  }

  markReady(order: Order): void {
    this.updatingId.set(order.id);
    this.vendor.updateOrderItemStatus(order.id, 'READY').subscribe({
      next: () => {
        this.notify.success(`Order #${order.tokenNumber} is Ready for pickup!`);
        this.orders.update(list =>
          list.map(o => o.id === order.id ? { ...o, status: 'READY' } : o)
        );
        this.updatingId.set(null);
      },
      error: () => {
        this.notify.error('Failed to update order status.');
        this.updatingId.set(null);
      },
    });
  }

  markDelivered(order: Order): void {
    this.updatingId.set(order.id);
    this.vendor.updateOrderItemStatus(order.id, 'DELIVERED').subscribe({
      next: () => {
        this.notify.success(`Order #${order.tokenNumber} delivered!`);
        this.orders.update(list =>
          list.map(o => o.id === order.id ? { ...o, status: 'DELIVERED' } : o)
        );
        this.updatingId.set(null);
      },
      error: () => {
        this.notify.error('Failed to update order status.');
        this.updatingId.set(null);
      },
    });
  }

  timeSince(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }
}
