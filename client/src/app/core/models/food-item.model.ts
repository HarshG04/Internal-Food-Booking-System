export interface FoodItem {
  id: number;
  shop: { id: number; name: string };
  name: string;
  price: number;
  stockQuantity: number;
  prepTimeMins: number;
  isVeg: boolean;
  avgRating: number;
  imageUrl?: string;
}

export interface MenuUpdateRequest {
  shop: { id: number };
  name: string;
  price: number;
  stockQuantity: number;
  prepTimeMins: number;
  isVeg: boolean;
  avgRating: number;
}
