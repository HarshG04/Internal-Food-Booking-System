import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { VendorService } from '../../../core/services/vendor.service';
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
    todayOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    menuItemCount: 0,
  });

  recentOrders = signal<Order[]>([]);

  constructor(
    private vendorService: VendorService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const employeeId = this.auth.currentUser()?.employeeId ?? 0;
    // Get vendor's shop by matching vendor.employeeId
    this.vendorService.getAllShops().subscribe({
      next: (shops) => {
        const myShop = shops.find(s => s.vendor?.employeeId === employeeId);
        const shopId = myShop?.id ?? 0;

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
              todayOrders: todayOrders.length,
              todayRevenue: todayOrders.reduce((s, o) => s + o.totalAmount, 0),
              totalRevenue: orders.reduce((s, o) => s + o.totalAmount, 0),
              menuItemCount: menu.length,
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
