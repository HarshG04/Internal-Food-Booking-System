import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { ManagerService } from '../../../core/services/manager.service';
import { Order } from '../../../core/models/order.model';
import { Restaurant } from '../../../core/models/restaurant.model';
import { Floor } from '../../../core/models/restaurant.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss',
})
export class ManagerDashboardComponent implements OnInit {
  loading = signal(true);

  stats = signal({
    totalFloors: 0,
    totalShops: 0,
    totalOrders: 0,
    todayRevenue: 0,
    openShops: 0,
    totalRevenue: 0,
  });

  topShops = signal<{ name: string; revenue: number; orders: number }[]>([]);

  constructor(private manager: ManagerService) {}

  ngOnInit(): void {
    forkJoin({
      floors: this.manager.getAllFloors(),     // GET /floor/getAll
      shops: this.manager.getAllShops(),       // GET /shop/getAll
      orders: this.manager.getAllOrders(),     // GET /order/getAll
    }).subscribe({
      next: ({ floors, shops, orders }) => {
        const today = new Date().toDateString();
        const todayOrders = orders.filter(
          o => new Date(o.createdAt).toDateString() === today
        );

        this.stats.set({
          totalFloors: floors.length,
          totalShops: shops.length,
          totalOrders: orders.length,
          todayRevenue: todayOrders.reduce((s, o) => s + o.totalAmount, 0),
          openShops: shops.filter(s => s.isOpen).length,
          totalRevenue: orders.reduce((s, o) => s + o.totalAmount, 0),
        });

        // Top shops by avg rating (order-to-shop mapping not available in API)
        const topRated = [...shops]
          .sort((a, b) => b.avgRating - a.avgRating)
          .slice(0, 5)
          .map(s => ({ name: s.name, revenue: 0, orders: 0 }));
        this.topShops.set(topRated);

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
