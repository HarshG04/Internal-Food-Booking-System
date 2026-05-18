import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);

  user = this.auth.currentUser;
  cartCount = this.cart.cartCount;
  isUser = computed(() => this.auth.getRole() === 'EMPLOYEE');

  logout(): void {
    this.auth.logout();
  }

  goHome(): void {
    const role = this.auth.getRole();
    if (role === 'VENDOR') this.router.navigate(['/vendor/dashboard']);
    else if (role === 'MANAGER') this.router.navigate(['/manager/dashboard']);
    else this.router.navigate(['/home']);
  }
}
