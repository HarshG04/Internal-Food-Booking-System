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
import { OrderItem, OrderItemStatus } from '../../../core/models/order.model';

type StatusFilter = 'ALL' | OrderItemStatus;

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
  orderItems = signal<OrderItem[]>([]);
  activeFilter = signal<StatusFilter>('ALL');
  updatingId = signal<number | null>(null);

  filters: StatusFilter[] = ['ALL', 'ORDERED', 'PREPARED', 'DELIVERED'];

  filteredItems = computed(() => {
    const f = this.activeFilter();
    const all = this.orderItems();
    return f === 'ALL' ? all : all.filter(i => i.status === f);
  });

  countFor(status: StatusFilter): number {
    if (status === 'ALL') return this.orderItems().length;
    return this.orderItems().filter(i => i.status === status).length;
  }

  statusColors: Record<string, string> = {
    ORDERED: '#ff9800',
    PREPARED: '#2196f3',
    DELIVERED: '#388e3c',
  };

  constructor(
    private vendor: VendorService,
    private notify: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    // GET /api/orders/my-shop — returns all OrderItems for the vendor's shop
    this.vendor.getMyShopOrders().subscribe({
      next: (items) => {
        this.orderItems.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  markPrepared(item: OrderItem): void {
    this.updatingId.set(item.id);
    // PATCH /api/order-items/{id}/status?status=PREPARED
    this.vendor.updateOrderItemStatus(item.id, 'PREPARED').subscribe({
      next: () => {
        this.notify.success(`Item marked as Prepared`);
        this.orderItems.update(list =>
          list.map(i => i.id === item.id ? { ...i, status: 'PREPARED' as OrderItemStatus } : i)
        );
        this.updatingId.set(null);
      },
      error: () => {
        this.notify.error('Failed to update status.');
        this.updatingId.set(null);
      },
    });
  }

  markDelivered(item: OrderItem): void {
    this.updatingId.set(item.id);
    // PATCH /api/order-items/{id}/status?status=DELIVERED
    this.vendor.updateOrderItemStatus(item.id, 'DELIVERED').subscribe({
      next: () => {
        this.notify.success(`Item marked as Delivered`);
        this.orderItems.update(list =>
          list.map(i => i.id === item.id ? { ...i, status: 'DELIVERED' as OrderItemStatus } : i)
        );
        this.updatingId.set(null);
      },
      error: () => {
        this.notify.error('Failed to update status.');
        this.updatingId.set(null);
      },
    });
  }

  timeSince(orderId: number | undefined): string {
    return orderId ? `Order #${orderId}` : '';
  }
}
