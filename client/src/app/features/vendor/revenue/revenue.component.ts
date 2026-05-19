import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { VendorService } from '../../../core/services/vendor.service';
import { OrderItem } from '../../../core/models/order.model';

interface PeriodStat {
  label: string;
  revenue: number;
  orders: number;
}

@Component({
  selector: 'app-vendor-revenue',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  templateUrl: './revenue.component.html',
  styleUrl: './revenue.component.scss',
})
export class VendorRevenueComponent implements OnInit {
  loading = signal(true);
  orderItems = signal<OrderItem[]>([]);

  daily = signal<PeriodStat[]>([]);
  monthly = signal<PeriodStat[]>([]);
  yearly = signal<PeriodStat[]>([]);

  totals = computed(() => {
    const all = this.orderItems();
    const total = all.reduce((s, i) => s + i.subtotal, 0);
    const uniqueOrders = new Set(all.map(i => i.order?.id)).size;
    return {
      total,
      count: uniqueOrders,
      avg: uniqueOrders ? Math.round(total / uniqueOrders) : 0,
    };
  });

  constructor(private vendor: VendorService) {}

  ngOnInit(): void {
    this.vendor.getMyShopOrders().subscribe({
      next: (items) => {
        this.orderItems.set(items);
        this.buildStats(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private buildStats(items: OrderItem[]): void {
    // Daily — last 7 days
    const dayMap: Record<string, PeriodStat> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      dayMap[key] = { label: key, revenue: 0, orders: 0 };
    }
    const dayOrderSets: Record<string, Set<number>> = {};
    items.forEach(i => {
      const key = new Date(i.order?.createdAt ?? '').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (dayMap[key]) {
        dayMap[key].revenue += i.subtotal;
        if (!dayOrderSets[key]) dayOrderSets[key] = new Set();
        if (i.order?.id) dayOrderSets[key].add(i.order.id);
        dayMap[key].orders = dayOrderSets[key].size;
      }
    });
    this.daily.set(Object.values(dayMap));

    // Monthly — last 6 months
    const monMap: Record<string, PeriodStat> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      monMap[key] = { label: key, revenue: 0, orders: 0 };
    }
    const monOrderSets: Record<string, Set<number>> = {};
    items.forEach(i => {
      const key = new Date(i.order?.createdAt ?? '').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (monMap[key]) {
        monMap[key].revenue += i.subtotal;
        if (!monOrderSets[key]) monOrderSets[key] = new Set();
        if (i.order?.id) monOrderSets[key].add(i.order.id);
        monMap[key].orders = monOrderSets[key].size;
      }
    });
    this.monthly.set(Object.values(monMap));

    // Yearly
    const yrMap: Record<string, PeriodStat> = {};
    const yrOrderSets: Record<string, Set<number>> = {};
    items.forEach(i => {
      const key = new Date(i.order?.createdAt ?? '').getFullYear().toString();
      if (!yrMap[key]) yrMap[key] = { label: key, revenue: 0, orders: 0 };
      yrMap[key].revenue += i.subtotal;
      if (!yrOrderSets[key]) yrOrderSets[key] = new Set();
      if (i.order?.id) yrOrderSets[key].add(i.order.id);
      yrMap[key].orders = yrOrderSets[key].size;
    });
    this.yearly.set(Object.values(yrMap).sort((a, b) => a.label.localeCompare(b.label)));
  }

  maxRevenue(stats: PeriodStat[]): number {
    return Math.max(...stats.map(s => s.revenue), 1);
  }
}
