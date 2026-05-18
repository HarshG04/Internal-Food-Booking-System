import { FoodItem } from './food-item.model';

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
