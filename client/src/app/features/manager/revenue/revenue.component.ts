import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import { ManagerService } from '../../../core/services/manager.service';
import { OrderItem } from '../../../core/models/order.model';
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
    MatFormFieldModule,
  ],
  templateUrl: './revenue.component.html',
  styleUrl: './revenue.component.scss',
})
export class ManagerRevenueComponent implements OnInit {
  loading = signal(true);
  orderItems = signal<OrderItem[]>([]);
  shops = signal<Restaurant[]>([]);
  shopStats = signal<ShopRevStat[]>([]);

  selectedShopId = signal<number | 'ALL'>('ALL');
  selectedPeriod = signal<'daily' | 'monthly' | 'yearly'>('monthly');

  readonly periods: Array<'daily' | 'monthly' | 'yearly'> = ['daily', 'monthly', 'yearly'];

  setPeriod(p: 'daily' | 'monthly' | 'yearly'): void {
    this.selectedPeriod.set(p);
  }

  totalRevenue = computed(() =>
    this.orderItems().reduce((s, i) => s + i.subtotal, 0)
  );
  totalOrders = computed(() =>
    new Set(this.orderItems().map(i => i.order?.id)).size
  );
  avgOrder = computed(() =>
    this.totalOrders() ? Math.round(this.totalRevenue() / this.totalOrders()) : 0
  );

  chartData = computed<{ label: string; revenue: number; orders: number }[]>(() => {
    const period = this.selectedPeriod();
    const shopId = this.selectedShopId();
    const filtered = shopId === 'ALL'
      ? this.orderItems()
      : this.orderItems().filter(i => i.foodItem?.shop?.id === shopId);

    const map: Record<string, { revenue: number; orderIds: Set<number> }> = {};

    if (period === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        map[key] = { revenue: 0, orderIds: new Set() };
      }
    } else if (period === 'monthly') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        map[key] = { revenue: 0, orderIds: new Set() };
      }
    }

    filtered.forEach(item => {
      let key: string;
      const date = new Date(item.order?.createdAt ?? '');
      if (period === 'daily') {
        key = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      } else if (period === 'monthly') {
        key = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      } else {
        key = date.getFullYear().toString();
      }
      if (!map[key]) map[key] = { revenue: 0, orderIds: new Set() };
      map[key].revenue += item.subtotal;
      if (item.order?.id) map[key].orderIds.add(item.order.id);
    });

    return Object.entries(map).map(([label, v]) => ({ label, revenue: v.revenue, orders: v.orderIds.size }));
  });

  constructor(private manager: ManagerService) {}

  ngOnInit(): void {
    forkJoin({
      items: this.manager.getAllOrderItems(),
      shops: this.manager.getAllShops(),
    }).subscribe({
      next: ({ items, shops }) => {
        this.orderItems.set(items);
        this.shops.set(shops);

        const stats: ShopRevStat[] = shops.map(s => {
          const shopItems = items.filter(i => i.foodItem?.shop?.id === s.id);
          const uniqueOrders = new Set(shopItems.map(i => i.order?.id)).size;
          return {
            shopId: s.id,
            shopName: s.name,
            floor: s.floor ? 'Floor ' + s.floor.floorNumber : 'Unassigned',
            totalRevenue: shopItems.reduce((sum, i) => sum + i.subtotal, 0),
            totalOrders: uniqueOrders,
          };
        }).sort((a, b) => b.totalRevenue - a.totalRevenue);
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
