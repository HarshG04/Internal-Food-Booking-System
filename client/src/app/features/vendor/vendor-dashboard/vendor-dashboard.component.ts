import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { VendorService } from '../../../core/services/vendor.service';
import { OrderItem } from '../../../core/models/order.model';
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
  orderItems = signal<OrderItem[]>([]);
  menuItems = signal<FoodItem[]>([]);

  stats = signal({
    totalOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    menuItemCount: 0,
  });

  recentOrderItems = signal<OrderItem[]>([]);

  constructor(
    private vendorService: VendorService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.vendorService.getMyShop().subscribe({
      next: (myShop) => {
        const shopId = myShop?.id ?? 0;

        forkJoin({
          items: this.vendorService.getMyShopOrders(),
          menu: this.vendorService.getMenuByShop(shopId),
        }).subscribe({
          next: ({ items, menu }) => {
            this.orderItems.set(items);
            this.menuItems.set(menu);

            const today = new Date().toDateString();
            const todayItems = items.filter(
              i => new Date(i.order?.createdAt ?? '').toDateString() === today
            );
            const uniqueOrderIds = new Set(items.map(i => i.order?.id));
            const todayOrderIds = new Set(todayItems.map(i => i.order?.id));

            this.stats.set({
              totalOrders: uniqueOrderIds.size,
              todayOrders: todayOrderIds.size,
              todayRevenue: todayItems.reduce((s, i) => s + i.subtotal, 0),
              totalRevenue: items.reduce((s, i) => s + i.subtotal, 0),
              menuItemCount: menu.length,
            });

            this.recentOrderItems.set(
              [...items]
                .sort((a, b) => new Date(b.order?.createdAt ?? '').getTime() - new Date(a.order?.createdAt ?? '').getTime())
                .slice(0, 5)
            );
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  timeOfDay(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }
}
