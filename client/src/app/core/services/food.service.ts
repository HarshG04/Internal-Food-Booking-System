import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';
import { FoodItem, MenuUpdateRequest } from '../models/food-item.model';
import { Floor } from '../models/restaurant.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FoodService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── FLOOR ──────────────────────────────────────────────
  // GET /api/floors
  getFloors(): Observable<Floor[]> {
    return this.http.get<Floor[]>(`${this.baseUrl}/floors`);
  }
  // GET /api/floors/active
  getActiveFloors(): Observable<Floor[]> {
    return this.http.get<Floor[]>(`${this.baseUrl}/floors/active`);
  }
  // GET /api/floors/{id}
  getFloorById(id: number): Observable<Floor> {
    return this.http.get<Floor>(`${this.baseUrl}/floors/${id}`);
  }
  // POST /api/floors
  createFloor(floor: Partial<Floor>): Observable<Floor> {
    return this.http.post<Floor>(`${this.baseUrl}/floors`, floor);
  }
  // PUT /api/floors/{id}
  updateFloor(id: number, floor: Partial<Floor>): Observable<Floor> {
    return this.http.put<Floor>(`${this.baseUrl}/floors/${id}`, floor);
  }
  // DELETE /api/floors/{id}
  deleteFloor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/floors/${id}`);
  }

  // ── SHOP ───────────────────────────────────────────────
  // GET /api/shops
  getAllShops(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shops`);
  }
  // GET /api/shops/{id}
  getShopById(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.baseUrl}/shops/${id}`);
  }
  // GET /api/shops/floor/{floorId}
  getShopsByFloor(floorId: number): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shops/floor/${floorId}`);
  }
  // GET /api/shops/open
  getOpenShops(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shops/open`);
  }
  // GET /api/shops/veg
  getVegShops(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/shops/veg`);
  }
  // POST /api/shops
  createShop(shop: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.baseUrl}/shops`, shop);
  }
  // PUT /api/shops/{id}
  updateShop(id: number, shop: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/shops/${id}`, shop);
  }
  // DELETE /api/shops/{id}
  deleteShop(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/shops/${id}`);
  }

  // ── FOOD ITEMS ─────────────────────────────────────────
  // GET /api/food-items
  getAllFoodItems(): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.baseUrl}/food-items`);
  }
  // GET /api/food-items/{id}
  getFoodItemById(id: number): Observable<FoodItem> {
    return this.http.get<FoodItem>(`${this.baseUrl}/food-items/${id}`);
  }
  // GET /api/food-items/shop/{shopId}
  getFoodItemsByShopId(shopId: number): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.baseUrl}/food-items/shop/${shopId}`);
  }
  // GET /api/food-items/shop/{shopId}/veg
  getVegFoodItemsByShop(shopId: number): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.baseUrl}/food-items/shop/${shopId}/veg`);
  }
  // GET /api/food-items/veg
  getVegFoodItems(): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.baseUrl}/food-items/veg`);
  }
  // GET /api/food-items/search?name=&isVeg=&shopId=&minPrice=&maxPrice=&maxPrepTime=&sortBy=
  searchFoodItems(params: {
    name?: string;
    isVeg?: boolean;
    shopId?: number;
    minPrice?: number;
    maxPrice?: number;
    maxPrepTime?: number;
    sortBy?: 'rating' | 'popularity';
  }): Observable<FoodItem[]> {
    let httpParams = new HttpParams();
    if (params.name) httpParams = httpParams.set('name', params.name);
    if (params.isVeg !== undefined) httpParams = httpParams.set('isVeg', String(params.isVeg));
    if (params.shopId !== undefined) httpParams = httpParams.set('shopId', String(params.shopId));
    if (params.minPrice !== undefined) httpParams = httpParams.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', String(params.maxPrice));
    if (params.maxPrepTime !== undefined) httpParams = httpParams.set('maxPrepTime', String(params.maxPrepTime));
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    return this.http.get<FoodItem[]>(`${this.baseUrl}/food-items/search`, { params: httpParams });
  }
  // POST /api/food-items
  createFoodItem(item: MenuUpdateRequest): Observable<FoodItem> {
    return this.http.post<FoodItem>(`${this.baseUrl}/food-items`, item);
  }
  // PUT /api/food-items/{id}
  updateFoodItem(id: number, item: MenuUpdateRequest): Observable<FoodItem> {
    return this.http.put<FoodItem>(`${this.baseUrl}/food-items/${id}`, item);
  }
  // DELETE /api/food-items/{id}
  deleteFoodItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/food-items/${id}`);
  }

  // ── IMAGES ─────────────────────────────────────────────
  // GET /api/shops/{id}/image
  getShopImageUrl(id: number): string {
    return `${this.baseUrl}/shops/${id}/image`;
  }
  // POST /api/shops/{id}/image
  uploadShopImage(id: number, file: File): Observable<void> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<void>(`${this.baseUrl}/shops/${id}/image`, fd);
  }
  // GET /api/food-items/{id}/image
  getFoodItemImageUrl(id: number): string {
    return `${this.baseUrl}/food-items/${id}/image`;
  }
  // POST /api/food-items/{id}/image
  uploadFoodItemImage(id: number, file: File): Observable<void> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<void>(`${this.baseUrl}/food-items/${id}/image`, fd);
  }

  // Convenience helpers used by home page
  getTrendingItems(): Observable<FoodItem[]> {
    return this.searchFoodItems({ sortBy: 'popularity' });
  }
  getFastItems(): Observable<FoodItem[]> {
    return this.searchFoodItems({ maxPrepTime: 10 });
  }
}
