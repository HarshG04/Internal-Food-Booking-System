export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: number;
  foodItemId: number;
  foodItemName: string;
  foodItemImageUrl: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  tokenNumber: string;
  userId: number;
  restaurantId: number;
  restaurantName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  estimatedTime: number; // minutes
  feedback?: string;
  rating?: number;
}

export interface PlaceOrderRequest {
  restaurantId: number;
  items: { foodItemId: number; quantity: number }[];
  paymentMethod: string;
}

export interface FeedbackRequest {
  orderId: number;
  rating: number;
  comment: string;
}
