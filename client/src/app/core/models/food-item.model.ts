export interface Category {
  id: number;
  name: string;
}

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  restaurantId: number;
  restaurantName: string;
  prepTime: number; // minutes
  isVeg: boolean;
  isAvailable: boolean;
  isTrending: boolean;
  rating: number;
  tags: string[];
  stock: number;
}

export interface MenuUpdateRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  prepTime: number;
  isVeg: boolean;
  isAvailable: boolean;
  stock: number;
  imageUrl?: string;
}
