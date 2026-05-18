import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-manager-layout',
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
  ],
  templateUrl: './manager-layout.component.html',
  styleUrl: './manager-layout.component.scss',
})
export class ManagerLayoutComponent {
  auth = inject(AuthService);
  user = this.auth.currentUser;

  navItems = [
    { path: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: 'floors', icon: 'apartment', label: 'Floor & Shop Management' },
    { path: 'revenue', icon: 'bar_chart', label: 'Revenue Overview' },
  ];
}
