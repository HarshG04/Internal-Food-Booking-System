import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { FoodService } from '../../../core/services/food.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { FoodItem } from '../../../core/models/food-item.model';
import { Restaurant, Floor } from '../../../core/models/restaurant.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private foodService = inject(FoodService);
  cart = inject(CartService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);

  user = this.auth.currentUser;
  firstName = computed(() => {
    const name = this.user()?.fullName;
    return name ? name.split(' ')[0] : 'there';
  });

  loading = signal(true);
  searchQuery = signal('');

  floors = signal<Floor[]>([]);
  selectedFloorId = signal<number | null>(null);
  restaurants = signal<Restaurant[]>([]);
  trendingItems = signal<FoodItem[]>([]);
  fastItems = signal<FoodItem[]>([]);

  ngOnInit(): void {
    forkJoin({
      floors: this.foodService.getActiveFloors(),
      restaurants: this.foodService.getAllShops(),
      trending: this.foodService.getTrendingItems(),
      fast: this.foodService.getFastItems(),
    }).subscribe({
      next: (data) => {
        this.floors.set(data.floors);
        this.restaurants.set(data.restaurants);
        this.trendingItems.set(data.trending);
        this.fastItems.set(data.fast);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Failed to load data. Please refresh.');
      },
    });
  }

  filterByFloor(floorId: number | null): void {
    this.selectedFloorId.set(floorId);
    this.loading.set(true);
    const obs = floorId
      ? this.foodService.getShopsByFloor(floorId)
      : this.foodService.getAllShops();
    obs.subscribe({
      next: (data) => {
        this.restaurants.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addToCart(item: FoodItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const cartRestaurantId = this.cart.getRestaurantId();
    if (cartRestaurantId && cartRestaurantId !== item.shop.id) {
      this.notify.error(
        'Your cart has items from a different restaurant. Clear cart first.'
      );
      return;
    }
    this.cart.addItem(item);
    this.notify.success(`${item.name} added to cart!`);
  }

  getQuantity(itemId: number): number {
    return this.cart.getQuantity(itemId);
  }

  removeFromCart(item: FoodItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cart.removeItem(item.id);
  }

  get filteredRestaurants(): Restaurant[] {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.restaurants();
    return this.restaurants().filter(
      (r) => r.name.toLowerCase().includes(q)
    );
  }

  greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
