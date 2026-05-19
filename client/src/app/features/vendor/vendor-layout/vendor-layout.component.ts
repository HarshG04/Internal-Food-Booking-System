import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../core/services/auth.service';
import { VendorService } from '../../../core/services/vendor.service';
import { Restaurant } from '../../../core/models/restaurant.model';

@Component({
  selector: 'app-vendor-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  templateUrl: './vendor-layout.component.html',
  styleUrl: './vendor-layout.component.scss',
})
export class VendorLayoutComponent implements OnInit {
  auth = inject(AuthService);
  private vendorService = inject(VendorService);

  user = this.auth.currentUser;
  myShop = signal<Restaurant | null>(null);

  navItems = [
    { path: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: 'orders', icon: 'receipt_long', label: 'Orders' },
    { path: 'menu', icon: 'restaurant_menu', label: 'Menu Management' },
    { path: 'revenue', icon: 'bar_chart', label: 'Revenue' },
  ];

  ngOnInit(): void {
    this.vendorService.getMyShop().subscribe({
      next: (shop) => this.myShop.set(shop),
    });
  }
}
