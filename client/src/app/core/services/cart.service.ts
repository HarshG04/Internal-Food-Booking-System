import { Injectable, signal, computed } from '@angular/core';
import { FoodItem } from '../models/food-item.model';
import { CartItem, Cart } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  cart = computed<Cart>(() => {
    const items = this.cartItems();
    const total = items.reduce(
      (sum, i) => sum + i.foodItem.price * i.quantity,
      0
    );
    return { items, total };
  });

  cartCount = computed(() =>
    this.cartItems().reduce((sum, i) => sum + i.quantity, 0)
  );

  addItem(foodItem: FoodItem): void {
    const existing = this.cartItems().find(
      (i) => i.foodItem.id === foodItem.id
    );
    if (existing) {
      this.cartItems.update((items) =>
        items.map((i) =>
          i.foodItem.id === foodItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      this.cartItems.update((items) => [...items, { foodItem, quantity: 1 }]);
    }
  }

  removeItem(foodItemId: number): void {
    const existing = this.cartItems().find(
      (i) => i.foodItem.id === foodItemId
    );
    if (!existing) return;

    if (existing.quantity > 1) {
      this.cartItems.update((items) =>
        items.map((i) =>
          i.foodItem.id === foodItemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
      );
    } else {
      this.cartItems.update((items) =>
        items.filter((i) => i.foodItem.id !== foodItemId)
      );
    }
  }

  deleteItem(foodItemId: number): void {
    this.cartItems.update((items) =>
      items.filter((i) => i.foodItem.id !== foodItemId)
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  getQuantity(foodItemId: number): number {
    return (
      this.cartItems().find((i) => i.foodItem.id === foodItemId)?.quantity ?? 0
    );
  }

  getRestaurantId(): number | null {
    const items = this.cartItems();
    return items.length > 0 ? items[0].foodItem.restaurantId : null;
  }
}
