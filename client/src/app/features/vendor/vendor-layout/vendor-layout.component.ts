import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../core/services/auth.service';

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
export class VendorLayoutComponent {
  auth = inject(AuthService);
  user = this.auth.currentUser;

  navItems = [
    { path: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: 'orders', icon: 'receipt_long', label: 'Orders' },
    { path: 'menu', icon: 'restaurant_menu', label: 'Menu Management' },
    { path: 'revenue', icon: 'bar_chart', label: 'Revenue' },
  ];
}
