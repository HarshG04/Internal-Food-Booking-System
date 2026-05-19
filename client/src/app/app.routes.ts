import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  // User routes
  {
    path: 'home',
    canActivate: [authGuard, roleGuard(['EMPLOYEE'])],
    loadComponent: () =>
      import('./features/user/home/home.component').then(
        (m) => m.HomeComponent
      ),
  },
  {
    path: 'restaurant/:id',
    canActivate: [authGuard, roleGuard(['EMPLOYEE'])],
    loadComponent: () =>
      import('./features/user/restaurant/restaurant.component').then(
        (m) => m.RestaurantComponent
      ),
  },
  {
    path: 'cart',
    canActivate: [authGuard, roleGuard(['EMPLOYEE'])],
    loadComponent: () =>
      import('./features/user/cart/cart.component').then(
        (m) => m.CartComponent
      ),
  },
  {
    path: 'checkout',
    canActivate: [authGuard, roleGuard(['EMPLOYEE'])],
    loadComponent: () =>
      import('./features/user/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
  },
  {
    path: 'payment/:orderId',
    canActivate: [authGuard, roleGuard(['EMPLOYEE'])],
    loadComponent: () =>
      import('./features/user/payment/payment.component').then(
        (m) => m.PaymentComponent
      ),
  },
  {
    path: 'orders',
    canActivate: [authGuard, roleGuard(['EMPLOYEE'])],
    loadComponent: () =>
      import('./features/user/order-history/order-history.component').then(
        (m) => m.OrderHistoryComponent
      ),
  },

  // Vendor routes
  {
    path: 'vendor',
    canActivate: [authGuard, roleGuard(['VENDOR'])],
    loadComponent: () =>
      import('./features/vendor/vendor-layout/vendor-layout.component').then(
        (m) => m.VendorLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/vendor/vendor-dashboard/vendor-dashboard.component').then(
            (m) => m.VendorDashboardComponent
          ),
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./features/vendor/menu-management/menu-management.component').then(
            (m) => m.MenuManagementComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/vendor/order-management/order-management.component').then(
            (m) => m.OrderManagementComponent
          ),
      },
      {
        path: 'revenue',
        loadComponent: () =>
          import('./features/vendor/revenue/revenue.component').then(
            (m) => m.VendorRevenueComponent
          ),
      },
    ],
  },

  // Manager routes
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./features/manager/manager-layout/manager-layout.component').then(
        (m) => m.ManagerLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/manager/manager-dashboard/manager-dashboard.component').then(
            (m) => m.ManagerDashboardComponent
          ),
      },
      {
        path: 'floors',
        loadComponent: () =>
          import('./features/manager/floor-management/floor-management.component').then(
            (m) => m.FloorManagementComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/manager/user-management/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
      },
      {
        path: 'revenue',
        loadComponent: () =>
          import('./features/manager/revenue/revenue.component').then(
            (m) => m.ManagerRevenueComponent
          ),
      },
    ],
  },

  { path: '**', redirectTo: '/login' },
];
