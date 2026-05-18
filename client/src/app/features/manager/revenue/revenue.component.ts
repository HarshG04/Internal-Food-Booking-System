import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { ManagerService } from '../../../core/services/manager.service';
import { Order } from '../../../core/models/order.model';
import { Restaurant } from '../../../core/models/restaurant.model';
import { forkJoin } from 'rxjs';

interface ShopRevStat {
  shopId: number;
  shopName: string;
  floor: string;
  totalRevenue: number;
  totalOrders: number;
}

@Component({
  selector: 'app-manager-revenue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSelectModule,
  ],
  templateUrl: './revenue.component.html',
  styleUrl: './revenue.component.scss',
})
export class ManagerRevenueComponent implements OnInit {
  loading = signal(true);
  orders = signal<Order[]>([]);
  shops = signal<Restaurant[]>([]);
  shopStats = signal<ShopRevStat[]>([]);

  selectedShopId = signal<number | 'ALL'>('ALL');
  selectedPeriod = signal<'daily' | 'monthly' | 'yearly'>('monthly');

  readonly periods: Array<'daily' | 'monthly' | 'yearly'> = ['daily', 'monthly', 'yearly'];

  setPeriod(p: 'daily' | 'monthly' | 'yearly'): void {
    this.selectedPeriod.set(p);
  }

  totalRevenue = computed(() =>
    this.orders().reduce((s, o) => s + o.totalAmount, 0)
  );
  totalOrders = computed(() => this.orders().length);
  avgOrder = computed(() =>
    this.totalOrders() ? Math.round(this.totalRevenue() / this.totalOrders()) : 0
  );

  chartData = computed<{ label: string; revenue: number; orders: number }[]>(() => {
    const period = this.selectedPeriod();
    const shopId = this.selectedShopId();
    const filteredOrders = shopId === 'ALL'
      ? this.orders()
      : this.orders().filter(o => o.restaurantId === shopId);

    const map: Record<string, { revenue: number; orders: number }> = {};

    if (period === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        map[key] = { revenue: 0, orders: 0 };
      }
    } else if (period === 'monthly') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        map[key] = { revenue: 0, orders: 0 };
      }
    }

    filteredOrders.forEach(o => {
      let key: string;
      if (period === 'daily') {
        key = new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      } else if (period === 'monthly') {
        key = new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      } else {
        key = new Date(o.createdAt).getFullYear().toString();
      }
      if (!map[key]) map[key] = { revenue: 0, orders: 0 };
      map[key].revenue += o.totalAmount;
      map[key].orders++;
    });

    return Object.entries(map).map(([label, v]) => ({ label, ...v }));
  });

  constructor(private manager: ManagerService) {}

  ngOnInit(): void {
    forkJoin({
      orders: this.manager.getAllOrders(),  // GET /order/getAll
      shops: this.manager.getAllShops(),    // GET /shop/getAll
    }).subscribe({
      next: ({ orders, shops }) => {
        this.orders.set(orders);
        this.shops.set(shops);

        const stats: ShopRevStat[] = shops.map(s => ({
          shopId: s.id,
          shopName: s.name,
          floor: s.floor?.name ?? 'Unassigned',
          totalRevenue: orders.filter(o => o.restaurantId === s.id).reduce((sum, o) => sum + o.totalAmount, 0),
          totalOrders: orders.filter(o => o.restaurantId === s.id).length,
        })).sort((a, b) => b.totalRevenue - a.totalRevenue);
        this.shopStats.set(stats);

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  maxRevenue(): number {
    return Math.max(...this.chartData().map(d => d.revenue), 1);
  }
}
