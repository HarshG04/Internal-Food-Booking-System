import { Component, OnInit, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { FoodService } from '../../../core/services/food.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Restaurant } from '../../../core/models/restaurant.model';
import { FoodItem } from '../../../core/models/food-item.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  templateUrl: './restaurant.component.html',
  styleUrl: './restaurant.component.scss',
})
export class RestaurantComponent implements OnInit {
  readonly id = input.required<string>();

  loading = signal(true);
  restaurant = signal<Restaurant | null>(null);
  items = signal<FoodItem[]>([]);

  private failedFoodIds = new Set<number>();
  private failedShopId = false;

  foodImgSrc(id: number): string {
    return this.failedFoodIds.has(id)
      ? '/food_placeholder.webp'
      : this.foodService.getFoodItemImageUrl(id);
  }
  heroImgSrc(): string {
    return this.failedShopId
      ? '/shop_placeholder.jpg'
      : this.foodService.getShopImageUrl(this.restaurant()!.id);
  }
  onFoodImgError(id: number, el: EventTarget | null): void {
    this.failedFoodIds.add(id);
    if (el) (el as HTMLImageElement).src = '/food_placeholder.webp';
  }
  onHeroImgError(el: EventTarget | null): void {
    this.failedShopId = true;
    if (el) (el as HTMLImageElement).src = '/shop_placeholder.jpg';
  }

  constructor(
    readonly foodService: FoodService,
    public cart: CartService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.id());
    forkJoin({
      // GET /shop/get/{id}
      restaurant: this.foodService.getShopById(id),
      // GET /fooditem/getByShop/{shopId}
      items: this.foodService.getFoodItemsByShopId(id),
    }).subscribe({
      next: (data) => {
        this.restaurant.set(data.restaurant);
        this.items.set(data.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Failed to load restaurant details.');
      },
    });
  }

  addToCart(item: FoodItem, event: Event): void {
    event.stopPropagation();
    const cartRestaurantId = this.cart.getRestaurantId();
    if (cartRestaurantId && cartRestaurantId !== item.shop.id) {
      this.notify.error('Clear your cart before ordering from a different restaurant.');
      return;
    }
    this.cart.addItem(item);
    this.notify.success(`${item.name} added to cart!`);
  }

  removeFromCart(item: FoodItem, event: Event): void {
    event.stopPropagation();
    this.cart.removeItem(item.id);
  }

  getQuantity(itemId: number): number {
    return this.cart.getQuantity(itemId);
  }
}
