import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  cartService = inject(CartService);
  cart = this.cartService.cart;

  updateQty(item: CartItem, delta: number): void {
    if (delta > 0) this.cartService.addItem(item.foodItem);
    else this.cartService.removeItem(item.foodItem.id);
  }

  remove(item: CartItem): void {
    this.cartService.deleteItem(item.foodItem.id);
  }

  get gst(): number {
    return Math.round(this.cart().total * 0.05);
  }

  get grandTotal(): number {
    return this.cart().total + this.gst;
  }
}
