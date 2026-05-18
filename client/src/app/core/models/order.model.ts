import { User } from './user.model';
import { FoodItem } from './food-item.model';

export type OrderItemStatus = 'ORDERED' | 'PREPARED' | 'DELIVERED';
export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Order {
  id: number;
  user: Partial<User>;
  tokenNo: string;
  totalAmount: number;
  createdAt: string;
  restaurantId?: number;
}

export interface OrderItem {
  id: number;
  user: Partial<User>;
  order: Partial<Order>;
  foodItem: Partial<FoodItem>;
  quantity: number;
  status: OrderItemStatus;
  subtotal: number;
}

export interface PlaceOrderRequest {
  userId: number;
  items: { foodItemId: number; quantity: number }[];
}

export interface FeedbackRequest {
  orderItem: { id: number };
  rating: number;
  review: string;
  reviewedAt: string;
}

export interface Feedback {
  id: number;
  orderItem: Partial<OrderItem>;
  rating: number;
  review: string;
  reviewedAt: string;
}
