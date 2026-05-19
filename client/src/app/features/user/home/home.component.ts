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
  searchResultsSource = signal<'local' | 'api'>('local');

  // Shop / floor drill-down
  selectedShopId = signal<number | null>(null);
  selectedShop = signal<Restaurant | null>(null);
  floorFoodItems = signal<FoodItem[]>([]);
  floorItemsLoading = signal(false);
  shopFoodItems = signal<FoodItem[]>([]);
  shopItemsLoading = signal(false);

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

  get view(): 'home' | 'floor' | 'shop' {
    if (this.selectedShopId() !== null) return 'shop';
    if (this.selectedFloorId() !== null) return 'floor';
    return 'home';
  }

  get selectedFloor(): Floor | null {
    const id = this.selectedFloorId();
    return id ? (this.floors().find(f => f.id === id) ?? null) : null;
  }

  get floorShops(): Restaurant[] {
    const floorId = this.selectedFloorId();
    return floorId ? this.restaurants().filter(r => r.floor.id === floorId) : [];
  }

  shopsOnFloor(floorId: number): Restaurant[] {
    return this.restaurants().filter(r => r.floor.id === floorId);
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
  }

  // Called on every filter/input change — filters the already-loaded local pool instantly
  onFilterChange(): void {
    if (!this.isSearchActive) {
      this.searchResults.set(null);
      return;
    }
    const q = this.searchQuery().toLowerCase();
    const isVeg = this.filterIsVeg();
    const minPrice = this.filterMinPrice();
    const maxPrice = this.filterMaxPrice();
    const maxPrepTime = this.filterMaxPrepTime();
    const sortBy = this.filterSortBy();

    // Combine trending + fast items, deduplicated by id
    const seen = new Set<number>();
    const pool: FoodItem[] = [];
    for (const item of [...this.trendingItems(), ...this.fastItems()]) {
      if (!seen.has(item.id)) { seen.add(item.id); pool.push(item); }
    }

    let results = pool.filter(item =>
      (!q || item.name.toLowerCase().includes(q)) &&
      (isVeg === null || item.isVeg === isVeg) &&
      (minPrice === null || item.price >= minPrice) &&
      (maxPrice === null || item.price <= maxPrice) &&
      (maxPrepTime === null || item.prepTimeMins <= maxPrepTime)
    );

    if (sortBy === 'rating') {
      results = [...results].sort((a, b) => b.avgRating - a.avgRating);
    }

    this.searchResultsSource.set('local');
    this.searchResults.set(results);
  }

  // Called only by the Search button — hits the backend endpoint
  runSearch(): void {
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
        this.searchResultsSource.set('api');
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
    this.selectedShopId.set(null);
    this.selectedShop.set(null);
    this.shopFoodItems.set([]);

    if (!floorId) {
      this.floorFoodItems.set([]);
      return;
    }

    const shops = this.floorShops;
    if (shops.length === 0) {
      this.floorFoodItems.set([]);
      return;
    }

    this.floorItemsLoading.set(true);
    forkJoin(shops.map(s => this.foodService.getFoodItemsByShopId(s.id))).subscribe({
      next: (results) => {
        this.floorFoodItems.set(results.flat());
        this.floorItemsLoading.set(false);
      },
      error: () => this.floorItemsLoading.set(false),
    });
  }

  selectShop(shop: Restaurant): void {
    this.selectedFloorId.set(shop.floor.id);
    this.selectedShopId.set(shop.id);
    this.selectedShop.set(shop);
    this.shopFoodItems.set([]);
    this.shopItemsLoading.set(true);
    this.foodService.getFoodItemsByShopId(shop.id).subscribe({
      next: (items) => {
        this.shopFoodItems.set(items);
        this.shopItemsLoading.set(false);
      },
      error: () => this.shopItemsLoading.set(false),
    });
  }

  goHome(): void {
    this.selectedFloorId.set(null);
    this.selectedShopId.set(null);
    this.selectedShop.set(null);
    this.floorFoodItems.set([]);
    this.shopFoodItems.set([]);
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
