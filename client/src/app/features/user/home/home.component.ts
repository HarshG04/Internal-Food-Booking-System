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
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { FoodService } from '../../../core/services/food.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { FoodItem } from '../../../core/models/food-item.model';
import { Restaurant, Floor } from '../../../core/models/restaurant.model';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
    MatSelectModule,
    MatSlideToggleModule,
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
  searchLoading = signal(false);

  floors = signal<Floor[]>([]);
  selectedFloorId = signal<number | null>(null);
  restaurants = signal<Restaurant[]>([]);
  trendingItems = signal<FoodItem[]>([]);
  fastItems = signal<FoodItem[]>([]);

  // Search & filter state
  searchQuery = signal('');
  filterIsVeg = signal<boolean | null>(null);
  filterMinPrice = signal<number | null>(null);
  filterMaxPrice = signal<number | null>(null);
  filterMaxPrepTime = signal<number | null>(null);
  filterSortBy = signal<'rating' | 'popularity' | null>(null);
  searchResults = signal<FoodItem[] | null>(null); // null = no active search

  private searchSubject = new Subject<void>();

  get isSearchActive(): boolean {
    return !!(
      this.searchQuery() ||
      this.filterIsVeg() !== null ||
      this.filterMinPrice() !== null ||
      this.filterMaxPrice() !== null ||
      this.filterMaxPrepTime() !== null ||
      this.filterSortBy()
    );
  }

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

    // Debounce all filter changes before hitting the API
    this.searchSubject.pipe(debounceTime(350)).subscribe(() => {
      this.runSearch();
    });
  }

  onFilterChange(): void {
    if (this.isSearchActive) {
      this.searchSubject.next();
    } else {
      this.searchResults.set(null);
    }
  }

  private runSearch(): void {
    this.searchLoading.set(true);
    const params: Parameters<typeof this.foodService.searchFoodItems>[0] = {};
    if (this.searchQuery()) params.name = this.searchQuery();
    if (this.filterIsVeg() !== null) params.isVeg = this.filterIsVeg()!;
    if (this.filterMinPrice() !== null) params.minPrice = this.filterMinPrice()!;
    if (this.filterMaxPrice() !== null) params.maxPrice = this.filterMaxPrice()!;
    if (this.filterMaxPrepTime() !== null) params.maxPrepTime = this.filterMaxPrepTime()!;
    if (this.filterSortBy()) params.sortBy = this.filterSortBy()!;

    this.foodService.searchFoodItems(params).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.searchLoading.set(false);
      },
      error: () => {
        this.searchLoading.set(false);
        this.notify.error('Search failed. Please try again.');
      },
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.filterIsVeg.set(null);
    this.filterMinPrice.set(null);
    this.filterMaxPrice.set(null);
    this.filterMaxPrepTime.set(null);
    this.filterSortBy.set(null);
    this.searchResults.set(null);
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
      this.notify.error('Your cart has items from a different restaurant. Clear cart first.');
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
    return this.restaurants();
  }

  greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
