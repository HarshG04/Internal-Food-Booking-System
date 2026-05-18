import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { VendorService } from '../../../core/services/vendor.service';
import { Order } from '../../../core/models/order.model';

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
  orders = signal<Order[]>([]);

  daily = signal<PeriodStat[]>([]);
  monthly = signal<PeriodStat[]>([]);
  yearly = signal<PeriodStat[]>([]);

  totals = computed(() => {
    const all = this.orders();
    return {
      total: all.reduce((s, o) => s + o.totalAmount, 0),
      count: all.length,
      avg: all.length ? Math.round(all.reduce((s,o)=>s+o.totalAmount,0)/all.length) : 0,
    };
  });

  constructor(private vendor: VendorService) {}

  ngOnInit(): void {
    // Uses GET /order/getAll via getVendorOrders
    this.vendor.getVendorOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.buildStats(orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private buildStats(orders: Order[]): void {
    // Daily — last 7 days
    const dayMap: Record<string, PeriodStat> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      dayMap[key] = { label: key, revenue: 0, orders: 0 };
    }
    orders.forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (dayMap[key]) {
        dayMap[key].revenue += o.totalAmount;
        dayMap[key].orders++;
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
    orders.forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      if (monMap[key]) {
        monMap[key].revenue += o.totalAmount;
        monMap[key].orders++;
      }
    });
    this.monthly.set(Object.values(monMap));

    // Yearly
    const yrMap: Record<string, PeriodStat> = {};
    orders.forEach(o => {
      const key = new Date(o.createdAt).getFullYear().toString();
      if (!yrMap[key]) yrMap[key] = { label: key, revenue: 0, orders: 0 };
      yrMap[key].revenue += o.totalAmount;
      yrMap[key].orders++;
    });
    this.yearly.set(Object.values(yrMap).sort((a, b) => a.label.localeCompare(b.label)));
  }

  maxRevenue(stats: PeriodStat[]): number {
    return Math.max(...stats.map(s => s.revenue), 1);
  }
}
