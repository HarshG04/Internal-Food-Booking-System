import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { VendorService } from '../../../core/services/vendor.service';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { FoodItem } from '../../../core/models/food-item.model';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatChipsModule,
  ],
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.scss',
})
export class VendorDashboardComponent implements OnInit {
  loading = signal(true);
  orders = signal<Order[]>([]);
  menuItems = signal<FoodItem[]>([]);

  stats = signal({
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    todayRevenue: 0,
    availableItems: 0,
  });

  recentOrders = signal<Order[]>([]);

  constructor(
    private vendorService: VendorService,
    private orderService: OrderService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const shopId = this.auth.currentUser()?.id ?? 0;
    forkJoin({
      orders: this.vendorService.getVendorOrders(),
      menu: this.vendorService.getMenuByShop(shopId),
    }).subscribe({
      next: ({ orders, menu }) => {
        this.orders.set(orders);
        this.menuItems.set(menu);

        const today = new Date().toDateString();
        const todayOrders = orders.filter(
          o => new Date(o.createdAt).toDateString() === today
        );

        this.stats.set({
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'PENDING').length,
          preparingOrders: orders.filter(o => o.status === 'PREPARING').length,
          readyOrders: orders.filter(o => o.status === 'READY').length,
          todayRevenue: todayOrders.reduce((s, o) => s + o.totalAmount, 0),
          availableItems: menu.filter(i => i.isAvailable).length,
        });

        this.recentOrders.set(
          orders
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusColor(status: string): string {
    const m: Record<string, string> = {
      PENDING: '#ff9800', CONFIRMED: '#2196f3', PREPARING: '#9c27b0',
      READY: '#4caf50', DELIVERED: '#388e3c', CANCELLED: '#f44336',
    };
    return m[status] ?? '#999';
  }

  timeOfDay(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }
}
